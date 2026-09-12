import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuestCreationSchema } from '../../../../src/shared/schemas/quest';
import { DIFFICULTY_XP_MAP } from '../../../../src/shared/constants/progression';
import type { Quest, QuestStatus } from '../../../../src/shared/types/quest';
import { getCharacterByUserId } from '../character/routes';

// In-memory store for backend test validation and offline execution
export const questsById = new Map<string, Quest>();

export function getQuestById(id: string): Quest | undefined {
  return questsById.get(id);
}

export function saveQuest(quest: Quest): void {
  questsById.set(quest.id, quest);
}

export function getQuestsByUserId(userId: string): Quest[] {
  return Array.from(questsById.values()).filter((q) => q.userId === userId);
}

export const questRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /quests - retrieve all quests for the authenticated user
  app.get<{ Querystring: { status?: QuestStatus } }>('/quests', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const userQuests = getQuestsByUserId(userId);
    const { status } = request.query;

    const filtered = status ? userQuests.filter((q) => q.status === status) : userQuests;

    // Sort: ACTIVE first, then by createdAt desc
    filtered.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return reply.status(200).send(filtered);
  });

  // GET /quests/:questId - retrieve specific quest
  app.get<{ Params: { questId: string } }>('/quests/:questId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { questId } = request.params;

    const quest = getQuestById(questId);
    if (!quest || quest.userId !== userId) {
      return reply.status(404).send({ error: 'Quest not found' });
    }

    return reply.status(200).send(quest);
  });

  // POST /quests - create a new quest with server-authoritative XP
  app.post('/quests', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    // 1. Validate input schema
    const parsed = QuestCreationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { title, description, category, difficulty, dueDate } = parsed.data;

    // 2. Server-authoritative XP assignment (strictly prevents client manipulation)
    const xpReward = DIFFICULTY_XP_MAP[difficulty];

    // 3. Resolve character
    const character = getCharacterByUserId(userId);
    const characterId = character ? character.id : `char-${userId}`;

    const newQuest: Quest = {
      id: 'quest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      characterId,
      title,
      description,
      category,
      difficulty,
      xpReward,
      status: 'ACTIVE',
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveQuest(newQuest);
    return reply.status(201).send(newQuest);
  });
};
