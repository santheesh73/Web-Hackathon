import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  getLevelFromXp,
  getXpProgress,
} from '../../../../src/shared/constants/progression';
import type { QuestCompletionResult } from '../../../../src/shared/types/quest';
import type { Character } from '../../../../src/shared/types/character';
import type { ChainProgressionResult } from '../../../../src/shared/types/quest-chain';
import { getQuestById, saveQuest } from '../quests/routes';
import { getCharacterByUserId, saveCharacter } from '../character/routes';
import {
  getOrCreateStreak,
  saveStreak,
  getStreakActivities,
  saveStreakActivity,
  getUtcTodayString,
  getUtcYesterdayString,
} from '../streak/routes';
import {
  findChainStepByQuestId,
  saveSteps,
  saveChain,
} from '../quest-chains/routes';

const CompleteQuestBodySchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
});

export const progressionRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /progression - get current user progression metrics
  app.get('/progression', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    const xp = character?.xp ?? 0;
    const level = character?.level ?? 1;

    return reply.status(200).send({
      level,
      xp,
      progress: getXpProgress(xp),
    });
  });

  // POST /quest-completion - atomic, idempotent quest completion integrating Streaks and Quest Chains
  app.post('/quest-completion', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const parsed = CompleteQuestBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { questId } = parsed.data;

    // 1. Retrieve quest
    const quest = getQuestById(questId);
    if (!quest || quest.userId !== userId) {
      return reply.status(404).send({ error: 'Quest not found' });
    }

    // 2. Strict atomic duplicate prevention
    if (quest.status === 'COMPLETED') {
      return reply.status(409).send({
        error: 'Quest has already been completed. Duplicate completion rejected.',
      });
    }

    // 3. Quest Chain sequential locking validation
    const chainContext = findChainStepByQuestId(questId);
    if (chainContext) {
      if (chainContext.step.status === 'LOCKED') {
        return reply.status(400).send({
          error: 'Cannot complete locked quest chain step. Complete preceding steps first.',
        });
      }
    }

    // 4. Mark quest completed
    const completedAt = new Date().toISOString();
    quest.status = 'COMPLETED';
    quest.completedAt = completedAt;
    quest.updatedAt = completedAt;
    saveQuest(quest);

    // 5. Resolve character or initialize baseline
    const existingChar = getCharacterByUserId(userId);
    const character: Character = existingChar
      ? { ...existingChar }
      : {
          id: 'char-' + userId,
          userId,
          name: 'Adventurer',
          avatar: 'warrior',
          lifeFocus: 'health',
          xp: 0,
          level: 1,
          createdAt: completedAt,
          updatedAt: completedAt,
        };

    const previousLevel = character.level;
    const previousXp = character.xp;
    const xpAwarded = quest.xpReward;
    const newXp = previousXp + xpAwarded;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > previousLevel;

    character.xp = newXp;
    character.level = newLevel;
    character.updatedAt = completedAt;
    saveCharacter(character);

    // 6. Streak and Daily Activity processing
    const today = getUtcTodayString();
    const yesterday = getUtcYesterdayString();
    const streak = getOrCreateStreak(userId);
    const userActivities = getStreakActivities(userId);
    const existingToday = userActivities.find((a) => a.activityDate === today);

    let firstToday = false;
    let streakExtended = false;
    let isNewRecord = false;
    let currentStreak = streak.currentStreak;
    let longestStreak = streak.longestStreak;

    if (!existingToday) {
      firstToday = true;
      if (streak.lastActivityDate === yesterday) {
        currentStreak = streak.currentStreak + 1;
        streakExtended = true;
      } else {
        currentStreak = 1;
        streakExtended = false;
      }

      isNewRecord = currentStreak > longestStreak;
      longestStreak = Math.max(longestStreak, currentStreak);

      streak.currentStreak = currentStreak;
      streak.longestStreak = longestStreak;
      streak.lastActivityDate = today;
      streak.updatedAt = completedAt;
      saveStreak(streak);

      saveStreakActivity({
        id: 'act-' + Date.now(),
        userId,
        activityDate: today,
        questsCompleted: 1,
        isRecovery: false,
        createdAt: completedAt,
      });
    } else {
      saveStreakActivity({
        id: existingToday.id,
        userId,
        activityDate: today,
        questsCompleted: existingToday.questsCompleted + 1,
        isRecovery: existingToday.isRecovery,
        createdAt: existingToday.createdAt,
      });
    }

    // 7. Quest Chain step unlock and completion processing
    let chainProgress = null;
    if (chainContext) {
      const { chain, step, allSteps } = chainContext;
      step.status = 'COMPLETED';
      step.updatedAt = completedAt;

      const nextStep = allSteps.find((s) => s.stepOrder === step.stepOrder + 1);
      let isChainCompleted = false;

      if (nextStep) {
        nextStep.status = 'AVAILABLE';
        nextStep.updatedAt = completedAt;
      } else {
        chain.status = 'COMPLETED';
        chain.updatedAt = completedAt;
        isChainCompleted = true;
        saveChain(chain);
      }

      saveSteps(chain.id, allSteps);

      const completedCount = allSteps.filter((s) => s.status === 'COMPLETED').length;

      chainProgress = {
        chainId: chain.id,
        chainTitle: chain.title,
        completedStepOrder: step.stepOrder,
        totalSteps: allSteps.length,
        completedSteps: completedCount,
        isChainCompleted,
        nextStepOrder: nextStep?.stepOrder,
      };
    }

    const result: QuestCompletionResult & {
      streak: {
        currentStreak: number;
        longestStreak: number;
        firstToday: boolean;
        streakExtended: boolean;
        isNewRecord: boolean;
      };
      chainProgress?: ChainProgressionResult | null;
    } = {
      quest,
      xpAwarded,
      character,
      previousLevel,
      newLevel,
      leveledUp,
      streak: {
        currentStreak,
        longestStreak,
        firstToday,
        streakExtended,
        isNewRecord,
      },
      chainProgress,
    };

    return reply.status(200).send(result);
  });
};
