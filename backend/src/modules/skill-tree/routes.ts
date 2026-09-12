import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { UnlockSkillSchema } from '../../../../src/shared/schemas/skill';
import {
  getSkillById,
  getSkillsByAttribute,
} from '../../../../src/shared/constants/skills';
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_DEFINITIONS,
} from '../../../../src/shared/constants/attributes';
import {
  calculateEvolutionTier,
  getEvolutionTitle,
} from '../../../../src/shared/constants/evolution';
import type {
  SkillTreeBranch,
  SkillTreeData,
  SkillNodeWithState,
  SkillUnlockResult,
} from '../../../../src/shared/types/skill';
import { getCharacterByUserId, saveCharacter } from '../character/routes';
import {
  getAttributeByKey,
  getCharacterAttributes,
} from '../attributes/routes';

// In-memory store: userId -> Set of unlocked skill IDs
export const unlockedSkillsByUserId = new Map<string, Set<string>>();

export function getUnlockedSkills(userId: string): string[] {
  const set = unlockedSkillsByUserId.get(userId);
  return set ? Array.from(set) : [];
}

export function saveUnlockedSkill(userId: string, skillId: string): void {
  let set = unlockedSkillsByUserId.get(userId);
  if (!set) {
    set = new Set<string>();
    unlockedSkillsByUserId.set(userId, set);
  }
  set.add(skillId);
}

export const skillTreeRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /skill-tree - retrieve full skill tree annotated with unlock and eligibility states
  app.get('/skill-tree', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    const availableSkillPoints = character?.skillPoints ?? 0;
    const unlockedSkillIds = new Set(getUnlockedSkills(userId));

    // Calculate total and spent SP
    let spentSkillPoints = 0;
    for (const skillId of unlockedSkillIds) {
      const node = getSkillById(skillId);
      if (node) {
        spentSkillPoints += node.spCost;
      }
    }
    const totalSkillPoints = availableSkillPoints + spentSkillPoints;

    // Build branches for all 6 attributes
    const branches: SkillTreeBranch[] = [];

    for (const attrKey of ATTRIBUTE_KEYS) {
      const def = ATTRIBUTE_DEFINITIONS[attrKey];
      const userAttr = getAttributeByKey(userId, attrKey);
      const branchNodes = getSkillsByAttribute(attrKey);

      const annotatedNodes: SkillNodeWithState[] = branchNodes.map((node) => {
        const isUnlocked = unlockedSkillIds.has(node.id);
        const missingRequirements: string[] = [];

        // Check SP
        const hasSp = availableSkillPoints >= node.spCost;
        if (!hasSp && !isUnlocked) {
          missingRequirements.push(
            `Requires ${node.spCost} Skill Point${node.spCost > 1 ? 's' : ''} (You have ${availableSkillPoints})`
          );
        }

        // Check Attribute Level
        const hasAttrLevel = userAttr.level >= node.requiredAttributeLevel;
        if (!hasAttrLevel && !isUnlocked) {
          missingRequirements.push(
            `Requires ${def.label} Level ${node.requiredAttributeLevel} (Current: ${userAttr.level})`
          );
        }

        // Check Prerequisite Skill
        let hasPrereq = true;
        if (node.prerequisiteSkillId) {
          hasPrereq = unlockedSkillIds.has(node.prerequisiteSkillId);
          if (!hasPrereq && !isUnlocked) {
            const prereqNode = getSkillById(node.prerequisiteSkillId);
            missingRequirements.push(
              `Requires prerequisite: ${prereqNode?.title || node.prerequisiteSkillId}`
            );
          }
        }

        const canUnlock = !isUnlocked && hasSp && hasAttrLevel && hasPrereq;

        return {
          ...node,
          isUnlocked,
          canUnlock,
          missingRequirements,
        };
      });

      branches.push({
        attributeKey: attrKey,
        label: def.label,
        skills: annotatedNodes,
      });
    }

    const responseData: SkillTreeData = {
      availableSkillPoints,
      spentSkillPoints,
      totalSkillPoints,
      unlockedSkillIds: Array.from(unlockedSkillIds),
      branches,
    };

    return reply.status(200).send(responseData);
  });

  // POST /skill-tree/unlock - unlock a skill node with server-authoritative validation
  app.post('/skill-tree/unlock', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const parsed = UnlockSkillSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { skillId } = parsed.data;
    const skillNode = getSkillById(skillId);
    if (!skillNode) {
      return reply.status(404).send({ error: `Skill node '${skillId}' not found.` });
    }

    const unlockedSkillIds = new Set(getUnlockedSkills(userId));

    // 1. Assert not already unlocked
    if (unlockedSkillIds.has(skillId)) {
      return reply.status(409).send({
        error: `Skill '${skillNode.title}' is already unlocked.`,
      });
    }

    // 2. Resolve character
    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character profile not found.' });
    }

    // 3. Assert available skill points
    if (character.skillPoints < skillNode.spCost) {
      return reply.status(400).send({
        error: `Insufficient skill points. Required: ${skillNode.spCost}, available: ${character.skillPoints}`,
      });
    }

    // 4. Assert attribute level requirement
    const userAttr = getAttributeByKey(userId, skillNode.attributeKey);
    if (userAttr.level < skillNode.requiredAttributeLevel) {
      return reply.status(400).send({
        error: `Attribute level prerequisite not met. Requires ${skillNode.attributeKey} Level ${skillNode.requiredAttributeLevel} (Current: ${userAttr.level})`,
      });
    }

    // 5. Assert prerequisite skill is unlocked
    if (skillNode.prerequisiteSkillId && !unlockedSkillIds.has(skillNode.prerequisiteSkillId)) {
      const prereqNode = getSkillById(skillNode.prerequisiteSkillId);
      return reply.status(400).send({
        error: `Prerequisite skill '${prereqNode?.title || skillNode.prerequisiteSkillId}' must be unlocked first.`,
      });
    }

    // 6. Deduct SP and record unlock
    character.skillPoints -= skillNode.spCost;
    saveUnlockedSkill(userId, skillId);
    unlockedSkillIds.add(skillId);

    // Calculate spent SP
    let spentSkillPoints = 0;
    for (const id of unlockedSkillIds) {
      const node = getSkillById(id);
      if (node) spentSkillPoints += node.spCost;
    }

    // 7. Check Character Evolution
    const userAttrs = getCharacterAttributes(userId);
    const maxAttrLevel = Math.max(...userAttrs.map((a) => a.level), 1);
    const newEvolutionTier = calculateEvolutionTier(
      character.level,
      unlockedSkillIds.size,
      maxAttrLevel
    );
    const newEvolutionTitle = getEvolutionTitle(character.avatar, newEvolutionTier);
    const newEvolutionUnlocked = newEvolutionTier > character.evolutionTier;

    character.evolutionTier = newEvolutionTier;
    character.evolutionTitle = newEvolutionTitle;
    character.updatedAt = new Date().toISOString();
    saveCharacter(character);

    const result: SkillUnlockResult = {
      success: true,
      skillId,
      unlockedSkillTitle: skillNode.title,
      availableSkillPoints: character.skillPoints,
      spentSkillPoints,
      unlockedSkillIds: Array.from(unlockedSkillIds),
      evolutionTier: newEvolutionTier,
      evolutionTitle: newEvolutionTitle,
      newEvolutionUnlocked,
    };

    return reply.status(200).send(result);
  });
};
