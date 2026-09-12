'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type {
  SkillTreeData,
  SkillUnlockResult,
  SkillTreeBranch,
  SkillNodeWithState,
} from '@/../src/shared/types/skill';
import {
  SKILL_NODES,
  getSkillById,
  getSkillsByAttribute,
} from '@/../src/shared/constants/skills';
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_DEFINITIONS,
  getAttributeLevelFromXp,
} from '@/../src/shared/constants/attributes';
import {
  calculateEvolutionTier,
  getEvolutionTitle,
} from '@/../src/shared/constants/evolution';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSkillTree() {
  const { user } = useAuth();
  const [treeData, setTreeData] = React.useState<SkillTreeData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [unlocking, setUnlocking] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchTree = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Attempt Fastify backend fetch
      const res = await fetch(`${BACKEND_URL}/skill-tree`, {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (res.ok) {
        const data: SkillTreeData = await res.json();
        setTreeData(data);
        setLoading(false);
        return;
      }
    } catch {
      // Backend not reached, fall through to localStorage fallback
    }

    // 2. Offline / LocalStorage fallback
    try {
      const charKey = `life_rpg_character_${user.id}`;
      const charStored = localStorage.getItem(charKey);
      const character = charStored ? JSON.parse(charStored) : { skillPoints: 0 };
      const availableSkillPoints = character.skillPoints || 0;

      const skillsKey = `life_rpg_unlocked_skills_${user.id}`;
      const skillsStored = localStorage.getItem(skillsKey);
      const unlockedSkillIds = new Set<string>(skillsStored ? JSON.parse(skillsStored) : []);

      const attrKey = `life_rpg_attributes_${user.id}`;
      const attrStored = localStorage.getItem(attrKey);
      const attrList: any[] = attrStored ? JSON.parse(attrStored) : [];

      let spentSkillPoints = 0;
      for (const id of unlockedSkillIds) {
        const node = getSkillById(id);
        if (node) spentSkillPoints += node.spCost;
      }

      const branches: SkillTreeBranch[] = [];

      for (const key of ATTRIBUTE_KEYS) {
        const def = ATTRIBUTE_DEFINITIONS[key];
        const userAttr = attrList.find((a) => a.attributeKey === key) || { level: 1, xp: 0 };
        const branchNodes = getSkillsByAttribute(key);

        const annotatedNodes: SkillNodeWithState[] = branchNodes.map((node) => {
          const isUnlocked = unlockedSkillIds.has(node.id);
          const missingRequirements: string[] = [];

          const hasSp = availableSkillPoints >= node.spCost;
          if (!hasSp && !isUnlocked) {
            missingRequirements.push(`Requires ${node.spCost} SP`);
          }

          const hasAttrLevel = userAttr.level >= node.requiredAttributeLevel;
          if (!hasAttrLevel && !isUnlocked) {
            missingRequirements.push(`Requires ${def.label} Lvl ${node.requiredAttributeLevel}`);
          }

          let hasPrereq = true;
          if (node.prerequisiteSkillId) {
            hasPrereq = unlockedSkillIds.has(node.prerequisiteSkillId);
            if (!hasPrereq && !isUnlocked) {
              const prereqNode = getSkillById(node.prerequisiteSkillId);
              missingRequirements.push(`Requires: ${prereqNode?.title || node.prerequisiteSkillId}`);
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
          attributeKey: key,
          label: def.label,
          skills: annotatedNodes,
        });
      }

      setTreeData({
        availableSkillPoints,
        spentSkillPoints,
        totalSkillPoints: availableSkillPoints + spentSkillPoints,
        unlockedSkillIds: Array.from(unlockedSkillIds),
        branches,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to assemble skill tree');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const unlockSkill = async (
    skillId: string
  ): Promise<{ success: boolean; error?: string; result?: SkillUnlockResult }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    setUnlocking(true);
    setError(null);

    try {
      // 1. Attempt backend call
      const res = await fetch(`${BACKEND_URL}/skill-tree/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ skillId }),
      });

      if (res.ok) {
        const result: SkillUnlockResult = await res.json();
        await fetchTree();
        setUnlocking(false);
        return { success: true, result };
      } else {
        const errData = await res.json().catch(() => ({}));
        setUnlocking(false);
        return {
          success: false,
          error: errData.error || `Server returned ${res.status}`,
        };
      }
    } catch {
      // 2. Offline fallback
      try {
        const skillNode = getSkillById(skillId);
        if (!skillNode) {
          setUnlocking(false);
          return { success: false, error: 'Skill node not found' };
        }

        const charKey = `life_rpg_character_${user.id}`;
        const charStored = localStorage.getItem(charKey);
        const character = charStored ? JSON.parse(charStored) : { skillPoints: 0, level: 1, avatar: 'warrior' };

        if (character.skillPoints < skillNode.spCost) {
          setUnlocking(false);
          return { success: false, error: 'Insufficient skill points' };
        }

        const skillsKey = `life_rpg_unlocked_skills_${user.id}`;
        const skillsStored = localStorage.getItem(skillsKey);
        const unlockedSkillIds: string[] = skillsStored ? JSON.parse(skillsStored) : [];

        if (unlockedSkillIds.includes(skillId)) {
          setUnlocking(false);
          return { success: false, error: 'Skill is already unlocked' };
        }

        // Deduct SP & save
        character.skillPoints -= skillNode.spCost;
        unlockedSkillIds.push(skillId);
        localStorage.setItem(skillsKey, JSON.stringify(unlockedSkillIds));

        // Evolution recalculation
        const attrKey = `life_rpg_attributes_${user.id}`;
        const attrStored = localStorage.getItem(attrKey);
        const attrList: any[] = attrStored ? JSON.parse(attrStored) : [];
        const maxAttrLevel = Math.max(...attrList.map((a: any) => a.level || 1), 1);

        const newTier = calculateEvolutionTier(
          character.level || 1,
          unlockedSkillIds.length,
          maxAttrLevel
        );
        const newTitle = getEvolutionTitle(character.avatar || 'warrior', newTier);
        const newEvolutionUnlocked = newTier > (character.evolutionTier || 1);

        character.evolutionTier = newTier;
        character.evolutionTitle = newTitle;
        localStorage.setItem(charKey, JSON.stringify(character));

        await fetchTree();
        setUnlocking(false);

        return {
          success: true,
          result: {
            success: true,
            skillId,
            unlockedSkillTitle: skillNode.title,
            availableSkillPoints: character.skillPoints,
            spentSkillPoints: 0,
            unlockedSkillIds,
            evolutionTier: newTier,
            evolutionTitle: newTitle,
            newEvolutionUnlocked,
          },
        };
      } catch (e: any) {
        setUnlocking(false);
        return { success: false, error: e.message || 'Failed to unlock skill' };
      }
    }
  };

  return {
    treeData,
    loading,
    unlocking,
    error,
    unlockSkill,
    refetch: fetchTree,
  };
}
