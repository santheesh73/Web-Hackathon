import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  CreateBossQuestSchema,
  UpdateBossQuestSchema,
  CreateBossObjectiveSchema,
  UpdateBossObjectiveSchema,
  LinkQuestSchema,
} from '../../../../src/shared/schemas/boss-quest';
import {
  BOSS_REWARD_MAP,
  calculateObjectiveProgress,
  isObjectiveCompleted,
  calculateBossProgress,
  isBossDefeated,
} from '../../../../src/shared/constants/boss-quests';
import type {
  BossQuest,
  BossObjective,
  BossObjectiveQuest,
  BossObjectiveWithQuests,
  BossQuestWithDetails,
} from '../../../../src/shared/types/boss-quest';
import type { Quest } from '../../../../src/shared/types/quest';
import { getQuestById } from '../quests/routes';
import { getCharacterByUserId } from '../character/routes';

// In-memory data store for backend test validation and offline execution
export const bossQuestsById = new Map<string, BossQuest>();
export const bossObjectivesByBossId = new Map<string, BossObjective[]>();
export const bossObjectiveQuestsByObjectiveId = new Map<string, BossObjectiveQuest[]>();

export function clearBossStore(): void {
  bossQuestsById.clear();
  bossObjectivesByBossId.clear();
  bossObjectiveQuestsByObjectiveId.clear();
}

export function getBossById(bossId: string): BossQuest | undefined {
  return bossQuestsById.get(bossId);
}

export function saveBoss(boss: BossQuest): void {
  bossQuestsById.set(boss.id, boss);
}

export function deleteBoss(bossId: string): void {
  const objectives = bossObjectivesByBossId.get(bossId) || [];
  for (const obj of objectives) {
    bossObjectiveQuestsByObjectiveId.delete(obj.id);
  }
  bossObjectivesByBossId.delete(bossId);
  bossQuestsById.delete(bossId);
}

export function getBossesByUserId(userId: string): BossQuest[] {
  return Array.from(bossQuestsById.values()).filter((b) => b.userId === userId);
}

export function getObjectivesByBossId(bossId: string): BossObjective[] {
  return bossObjectivesByBossId.get(bossId) || [];
}

export function saveObjectives(bossId: string, objectives: BossObjective[]): void {
  bossObjectivesByBossId.set(bossId, objectives);
}

export function getObjectiveQuests(objectiveId: string): BossObjectiveQuest[] {
  return bossObjectiveQuestsByObjectiveId.get(objectiveId) || [];
}

export function saveObjectiveQuests(objectiveId: string, links: BossObjectiveQuest[]): void {
  bossObjectiveQuestsByObjectiveId.set(objectiveId, links);
}

export function findBossObjectivesByQuestId(questId: string): Array<{
  boss: BossQuest;
  objective: BossObjective;
  allObjectives: BossObjective[];
}> {
  const matches: Array<{
    boss: BossQuest;
    objective: BossObjective;
    allObjectives: BossObjective[];
  }> = [];

  for (const [objectiveId, links] of bossObjectiveQuestsByObjectiveId.entries()) {
    const hasQuest = links.some((l) => l.questId === questId);
    if (hasQuest) {
      for (const [bossId, objectives] of bossObjectivesByBossId.entries()) {
        const obj = objectives.find((o) => o.id === objectiveId);
        if (obj) {
          const boss = bossQuestsById.get(bossId);
          if (boss) {
            matches.push({ boss, objective: obj, allObjectives: objectives });
          }
        }
      }
    }
  }

  return matches;
}

export function buildBossWithDetails(boss: BossQuest): BossQuestWithDetails {
  const rawObjectives = getObjectivesByBossId(boss.id);
  const sortedObjectives = [...rawObjectives].sort((a, b) => a.displayOrder - b.displayOrder);

  const enrichedObjectives: BossObjectiveWithQuests[] = sortedObjectives.map((obj) => {
    const links = getObjectiveQuests(obj.id);
    const linkedQuests: Quest[] = [];

    for (const link of links) {
      const q = getQuestById(link.questId);
      if (q) {
        linkedQuests.push(q);
      }
    }

    const completedQuestsCount = linkedQuests.filter((q) => q.status === 'COMPLETED').length;
    const progressPercent = calculateObjectiveProgress(completedQuestsCount, obj.requiredProgress);
    const isCompleted = isObjectiveCompleted(completedQuestsCount, obj.requiredProgress);

    return {
      ...obj,
      linkedQuests,
      completedQuestsCount,
      progressPercent,
      isCompleted,
    };
  });

  const totalObjectivesCount = enrichedObjectives.length;
  const completedObjectivesCount = enrichedObjectives.filter((o) => o.isCompleted).length;
  const progressPercent = calculateBossProgress(enrichedObjectives);
  const isDefeated = isBossDefeated(enrichedObjectives);

  return {
    ...boss,
    objectives: enrichedObjectives,
    totalObjectivesCount,
    completedObjectivesCount,
    progressPercent,
    isDefeated,
  };
}

export const bossQuestRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /boss-quests - list user's boss quests with detailed progress
  app.get('/boss-quests', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const userBosses = getBossesByUserId(userId);
    const enriched = userBosses.map((b) => buildBossWithDetails(b));

    return reply.status(200).send(enriched);
  });

  // POST /boss-quests - create a new Boss Quest with initial objectives
  app.post('/boss-quests', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const parsed = CreateBossQuestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { title, description, difficulty, deadline, objectives } = parsed.data;

    // Server-authoritative reward calculation
    const rewardXp = BOSS_REWARD_MAP[difficulty] ?? 250;
    const character = getCharacterByUserId(userId);
    const characterId = character ? character.id : 'char-' + userId;
    const now = new Date().toISOString();
    const bossId = 'boss-' + Date.now();

    const newBoss: BossQuest = {
      id: bossId,
      characterId,
      userId,
      title,
      description: description || '',
      difficulty,
      status: 'ACTIVE',
      deadline: deadline || undefined,
      rewardXp,
      createdAt: now,
      updatedAt: now,
    };

    saveBoss(newBoss);

    // Create objectives
    const createdObjectives: BossObjective[] = objectives.map((obj, idx) => ({
      id: 'bobj-' + Date.now() + '-' + idx,
      bossId,
      userId,
      title: obj.title,
      description: obj.description || '',
      displayOrder: idx + 1,
      requiredProgress: obj.requiredProgress || 1,
      createdAt: now,
      updatedAt: now,
    }));

    saveObjectives(bossId, createdObjectives);

    const detailed = buildBossWithDetails(newBoss);
    return reply.status(201).send(detailed);
  });

  // GET /boss-quests/:bossId - retrieve single boss details
  app.get<{ Params: { bossId: string } }>('/boss-quests/:bossId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    const detailed = buildBossWithDetails(boss);
    return reply.status(200).send(detailed);
  });

  // PATCH /boss-quests/:bossId - update boss quest details
  app.patch<{ Params: { bossId: string } }>('/boss-quests/:bossId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    if (boss.status === 'COMPLETED') {
      return reply.status(400).send({ error: 'Cannot modify a completed Boss Quest' });
    }

    const parsed = UpdateBossQuestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    if (parsed.data.title !== undefined) boss.title = parsed.data.title;
    if (parsed.data.description !== undefined) boss.description = parsed.data.description;
    if (parsed.data.deadline !== undefined) boss.deadline = parsed.data.deadline;
    if (parsed.data.status !== undefined) boss.status = parsed.data.status;
    boss.updatedAt = new Date().toISOString();

    saveBoss(boss);
    const detailed = buildBossWithDetails(boss);
    return reply.status(200).send(detailed);
  });

  // DELETE /boss-quests/:bossId - delete boss quest
  app.delete<{ Params: { bossId: string } }>('/boss-quests/:bossId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    deleteBoss(bossId);
    return reply.status(200).send({ success: true, message: 'Boss Quest deleted' });
  });

  // POST /boss-quests/:bossId/objectives - add an objective to a boss
  app.post<{ Params: { bossId: string } }>('/boss-quests/:bossId/objectives', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    if (boss.status === 'COMPLETED') {
      return reply.status(400).send({ error: 'Cannot modify objectives of a completed Boss Quest' });
    }

    const parsed = CreateBossObjectiveSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const currentObjectives = getObjectivesByBossId(bossId);
    const now = new Date().toISOString();
    const newObjective: BossObjective = {
      id: 'bobj-' + Date.now(),
      bossId,
      userId,
      title: parsed.data.title,
      description: parsed.data.description || '',
      displayOrder: parsed.data.displayOrder ?? currentObjectives.length + 1,
      requiredProgress: parsed.data.requiredProgress || 1,
      createdAt: now,
      updatedAt: now,
    };

    currentObjectives.push(newObjective);
    saveObjectives(bossId, currentObjectives);

    return reply.status(201).send(newObjective);
  });

  // PATCH /boss-quests/:bossId/objectives/:objectiveId - update objective
  app.patch<{ Params: { bossId: string; objectiveId: string } }>(
    '/boss-quests/:bossId/objectives/:objectiveId',
    async (request, reply) => {
      const authHeader = request.headers.authorization;
      const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
      const { bossId, objectiveId } = request.params;

      const boss = getBossById(bossId);
      if (!boss || boss.userId !== userId) {
        return reply.status(404).send({ error: 'Boss Quest not found' });
      }

      if (boss.status === 'COMPLETED') {
        return reply.status(400).send({ error: 'Cannot modify objectives of a completed Boss Quest' });
      }

      const objectives = getObjectivesByBossId(bossId);
      const objective = objectives.find((o) => o.id === objectiveId);
      if (!objective) {
        return reply.status(404).send({ error: 'Objective not found' });
      }

      const parsed = UpdateBossObjectiveSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          details: parsed.error.errors.map((e) => e.message),
        });
      }

      if (parsed.data.title !== undefined) objective.title = parsed.data.title;
      if (parsed.data.description !== undefined) objective.description = parsed.data.description;
      if (parsed.data.displayOrder !== undefined) objective.displayOrder = parsed.data.displayOrder;
      if (parsed.data.requiredProgress !== undefined) objective.requiredProgress = parsed.data.requiredProgress;
      objective.updatedAt = new Date().toISOString();

      saveObjectives(bossId, objectives);
      return reply.status(200).send(objective);
    }
  );

  // DELETE /boss-quests/:bossId/objectives/:objectiveId - remove objective
  app.delete<{ Params: { bossId: string; objectiveId: string } }>(
    '/boss-quests/:bossId/objectives/:objectiveId',
    async (request, reply) => {
      const authHeader = request.headers.authorization;
      const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
      const { bossId, objectiveId } = request.params;

      const boss = getBossById(bossId);
      if (!boss || boss.userId !== userId) {
        return reply.status(404).send({ error: 'Boss Quest not found' });
      }

      if (boss.status === 'COMPLETED') {
        return reply.status(400).send({ error: 'Cannot modify objectives of a completed Boss Quest' });
      }

      const objectives = getObjectivesByBossId(bossId);
      const filtered = objectives.filter((o) => o.id !== objectiveId);
      if (filtered.length === objectives.length) {
        return reply.status(404).send({ error: 'Objective not found' });
      }

      bossObjectiveQuestsByObjectiveId.delete(objectiveId);
      saveObjectives(bossId, filtered);

      return reply.status(200).send({ success: true, message: 'Objective deleted' });
    }
  );

  // POST /boss-quests/:bossId/link-quest - link an existing quest to a boss objective
  app.post<{ Params: { bossId: string } }>('/boss-quests/:bossId/link-quest', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    if (boss.status === 'COMPLETED') {
      return reply.status(400).send({ error: 'Cannot link quests to a completed Boss Quest' });
    }

    const parsed = LinkQuestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { questId, objectiveId } = parsed.data;

    // Verify objective belongs to this boss
    const objectives = getObjectivesByBossId(bossId);
    const targetObj = objectives.find((o) => o.id === objectiveId);
    if (!targetObj) {
      return reply.status(404).send({ error: 'Objective does not belong to this Boss Quest' });
    }

    // Verify quest exists and belongs to current user
    const quest = getQuestById(questId);
    if (!quest || quest.userId !== userId) {
      return reply.status(404).send({ error: 'Quest not found or unauthorized' });
    }

    // Check for duplicate link
    const existingLinks = getObjectiveQuests(objectiveId);
    if (existingLinks.some((l) => l.questId === questId)) {
      return reply.status(409).send({ error: 'Quest is already linked to this objective' });
    }

    const newLink: BossObjectiveQuest = {
      id: 'boq-' + Date.now(),
      objectiveId,
      questId,
      userId,
      createdAt: new Date().toISOString(),
    };

    existingLinks.push(newLink);
    saveObjectiveQuests(objectiveId, existingLinks);

    return reply.status(201).send({ success: true, link: newLink });
  });

  // DELETE /boss-quests/:bossId/link-quest - unlink a quest from an objective
  app.delete<{ Params: { bossId: string } }>('/boss-quests/:bossId/link-quest', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { bossId } = request.params;

    const boss = getBossById(bossId);
    if (!boss || boss.userId !== userId) {
      return reply.status(404).send({ error: 'Boss Quest not found' });
    }

    if (boss.status === 'COMPLETED') {
      return reply.status(400).send({ error: 'Cannot unlink quests from a completed Boss Quest' });
    }

    const parsed = LinkQuestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { questId, objectiveId } = parsed.data;
    const links = getObjectiveQuests(objectiveId);
    const filtered = links.filter((l) => l.questId !== questId);

    if (filtered.length === links.length) {
      return reply.status(404).send({ error: 'Quest link not found' });
    }

    saveObjectiveQuests(objectiveId, filtered);
    return reply.status(200).send({ success: true, message: 'Quest unlinked successfully' });
  });
};
