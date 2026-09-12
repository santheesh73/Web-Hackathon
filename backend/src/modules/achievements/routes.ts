import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import type {
  Achievement,
  UserAchievement,
  AchievementWithProgress,
  AchievementsSummary,
  RequirementType,
  AchievementCategory,
} from '../../../../src/shared/types/achievement';
import { SEED_ACHIEVEMENTS } from '../../../../src/shared/constants/achievements';
import { getCharacterByUserId } from '../character/routes';
import { getQuestsByUserId } from '../quests/routes';
import { getOrCreateStreak } from '../streak/routes';
import { getChainsByUserId } from '../quest-chains/routes';
import { bossQuestsById } from '../boss-quests/routes';
import { getUnlockedSkills } from '../skill-tree/routes';
import { getPurchasesForCharacter, getTransactionsForUser } from '../rewards/routes';
import { getEquippedItemsForCharacter } from '../inventory/routes';

// In-memory data store for user achievements: key = `${characterId}:${achievementId}`
export const userAchievements = new Map<string, UserAchievement>();

export function resetAchievementsStore(): void {
  userAchievements.clear();
}

export function getUserAchievementsForCharacter(characterId: string): UserAchievement[] {
  return Array.from(userAchievements.values()).filter((ua) => ua.characterId === characterId);
}

/**
 * Deterministically computes current progress for a given requirement type.
 */
export function calculateProgressForRequirement(
  userId: string,
  characterId: string,
  requirementType: RequirementType
): number {
  switch (requirementType) {
    case 'QUEST_COUNT': {
      const quests = getQuestsByUserId(userId);
      return quests.filter((q) => q.status === 'COMPLETED').length;
    }
    case 'STREAK_DAYS': {
      const streak = getOrCreateStreak(userId);
      return Math.max(streak.currentStreak || 0, streak.longestStreak || 0);
    }
    case 'QUEST_CHAIN_COUNT': {
      const chains = getChainsByUserId(userId);
      return chains.filter((c) => c.status === 'COMPLETED').length;
    }
    case 'BOSS_COMPLETION_COUNT': {
      const allBosses = Array.from(bossQuestsById.values());
      return allBosses.filter((b) => b.userId === userId && b.status === 'COMPLETED').length;
    }
    case 'PLAYER_LEVEL': {
      const char = getCharacterByUserId(userId);
      return char?.level ?? 1;
    }
    case 'SKILL_COUNT': {
      const skills = getUnlockedSkills(userId);
      return skills.length;
    }
    case 'GOLD_EARNED': {
      const txs = getTransactionsForUser(userId);
      return txs
        .filter((t) => t.type === 'EARN')
        .reduce((sum, t) => sum + t.amount, 0);
    }
    case 'ITEM_COUNT': {
      const purchases = getPurchasesForCharacter(characterId);
      return purchases.length;
    }
    case 'EQUIPPED_ITEM_COUNT': {
      const equipped = getEquippedItemsForCharacter(characterId);
      return equipped.length;
    }
    default:
      return 0;
  }
}

/**
 * Evaluates all achievements for a user, records progress, detects new unlocks,
 * and prevents duplicate unlock triggers.
 */
export function evaluateUserAchievements(userId: string): {
  achievements: AchievementWithProgress[];
  newlyUnlocked: Achievement[];
} {
  const character = getCharacterByUserId(userId);
  if (!character) {
    // Return base catalog with 0 progress if character not found
    return {
      achievements: SEED_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        progress: 0,
        isUnlocked: false,
        unlockedAt: null,
        progressPercent: 0,
      })),
      newlyUnlocked: [],
    };
  }

  const newlyUnlocked: Achievement[] = [];
  const results: AchievementWithProgress[] = [];

  for (const ach of SEED_ACHIEVEMENTS) {
    if (!ach.isActive) continue;

    const rawProgress = calculateProgressForRequirement(userId, character.id, ach.requirementType);
    const progress = Math.min(rawProgress, ach.target);
    const progressPercent = Math.min(Math.round((progress / ach.target) * 100), 100);

    const storeKey = `${character.id}:${ach.id}`;
    let userAch = userAchievements.get(storeKey);
    const now = new Date().toISOString();

    if (!userAch) {
      const shouldUnlock = progress >= ach.target;
      userAch = {
        id: randomUUID(),
        characterId: character.id,
        userId,
        achievementId: ach.id,
        progress,
        isUnlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? now : null,
        createdAt: now,
        updatedAt: now,
        achievement: ach,
      };
      userAchievements.set(storeKey, userAch);

      if (shouldUnlock) {
        newlyUnlocked.push(ach);
      }
    } else {
      // Record already exists
      if (!userAch.isUnlocked && progress >= ach.target) {
        userAch.isUnlocked = true;
        userAch.progress = progress;
        userAch.unlockedAt = now;
        userAch.updatedAt = now;
        newlyUnlocked.push(ach);
      } else if (!userAch.isUnlocked && progress > userAch.progress) {
        userAch.progress = progress;
        userAch.updatedAt = now;
      }
    }

    results.push({
      ...ach,
      progress: userAch.progress,
      isUnlocked: userAch.isUnlocked,
      unlockedAt: userAch.unlockedAt,
      progressPercent: userAch.isUnlocked ? 100 : progressPercent,
    });
  }

  return {
    achievements: results,
    newlyUnlocked,
  };
}

export const achievementRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /achievements - list all achievements with user progress and filtering
  app.get('/achievements', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const { achievements } = evaluateUserAchievements(userId);

    const query = request.query as {
      status?: 'ALL' | 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
      category?: AchievementCategory;
      search?: string;
      sortBy?: 'RECENT' | 'PROGRESS' | 'NAME';
    };

    let filtered = [...achievements];

    // Filter by Status
    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'UNLOCKED') {
        filtered = filtered.filter((a) => a.isUnlocked);
      } else if (query.status === 'IN_PROGRESS') {
        filtered = filtered.filter((a) => !a.isUnlocked && a.progress > 0);
      } else if (query.status === 'LOCKED') {
        filtered = filtered.filter((a) => !a.isUnlocked && a.progress === 0);
      }
    }

    // Filter by Category
    if (query?.category) {
      filtered = filtered.filter((a) => a.category === query.category);
    }

    // Filter by Search Query
    if (query?.search?.trim()) {
      const q = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Sort items
    const sortBy = query?.sortBy || 'RECENT';
    if (sortBy === 'NAME') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'PROGRESS') {
      filtered.sort((a, b) => b.progressPercent - a.progressPercent);
    } else {
      // RECENT: Unlocked first sorted by unlockedAt desc, then in-progress by progress desc, then locked
      filtered.sort((a, b) => {
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        if (a.isUnlocked && b.isUnlocked) {
          return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
        }
        return b.progressPercent - a.progressPercent;
      });
    }

    return reply.status(200).send(filtered);
  });

  // GET /achievements/:achievementId - retrieve single achievement detail with progress
  app.get('/achievements/:achievementId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { achievementId } = request.params as { achievementId: string };

    const { achievements } = evaluateUserAchievements(userId);
    const found = achievements.find((a) => a.id === achievementId || a.key === achievementId);

    if (!found) {
      return reply.status(404).send({ error: 'Achievement not found' });
    }

    return reply.status(200).send(found);
  });

  // GET /achievements/summary - retrieve summary counts for dashboard
  app.get('/achievements/summary', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const { achievements } = evaluateUserAchievements(userId);
    const total = achievements.length;
    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
    const inProgressCount = achievements.filter((a) => !a.isUnlocked && a.progress > 0).length;
    const lockedCount = achievements.filter((a) => !a.isUnlocked && a.progress === 0).length;
    const completionPercent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    const summary: AchievementsSummary = {
      total,
      unlockedCount,
      inProgressCount,
      lockedCount,
      completionPercent,
    };

    return reply.status(200).send(summary);
  });
};
