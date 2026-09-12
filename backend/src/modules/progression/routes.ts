import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  getLevelFromXp,
  getXpProgress,
} from '../../../../src/shared/constants/progression';
import type { QuestCompletionResult } from '../../../../src/shared/types/quest';
import type { Character } from '../../../../src/shared/types/character';
import { getQuestById, saveQuest } from '../quests/routes';
import { getCharacterByUserId, saveCharacter } from '../character/routes';

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

  // POST /quest-completion - atomic, idempotent quest completion
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

    // 3. Mark quest completed
    const completedAt = new Date().toISOString();
    quest.status = 'COMPLETED';
    quest.completedAt = completedAt;
    quest.updatedAt = completedAt;
    saveQuest(quest);

    // 4. Resolve character or initialize baseline
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

    const result: QuestCompletionResult = {
      quest,
      xpAwarded,
      character,
      previousLevel,
      newLevel,
      leveledUp,
    };

    return reply.status(200).send(result);
  });
};
