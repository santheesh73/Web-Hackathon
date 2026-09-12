import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { QuestChainCreationSchema } from '../../../../src/shared/schemas/quest-chain';
import { DIFFICULTY_XP_MAP } from '../../../../src/shared/constants/progression';
import type {
  QuestChain,
  QuestChainStep,
  QuestChainWithSteps,
} from '../../../../src/shared/types/quest-chain';
import type { Quest } from '../../../../src/shared/types/quest';
import { getQuestById, saveQuest } from '../quests/routes';

// In-memory store for backend test validation and offline execution
export const questChainsById = new Map<string, QuestChain>();
export const questChainStepsByChainId = new Map<string, QuestChainStep[]>();

export function getChainById(chainId: string): QuestChain | undefined {
  return questChainsById.get(chainId);
}

export function saveChain(chain: QuestChain): void {
  questChainsById.set(chain.id, chain);
}

export function getStepsByChainId(chainId: string): QuestChainStep[] {
  return questChainStepsByChainId.get(chainId) || [];
}

export function saveSteps(chainId: string, steps: QuestChainStep[]): void {
  questChainStepsByChainId.set(chainId, steps);
}

export function getChainsByUserId(userId: string): QuestChain[] {
  return Array.from(questChainsById.values()).filter((c) => c.userId === userId);
}

export function findChainStepByQuestId(questId: string): {
  chain: QuestChain;
  step: QuestChainStep;
  allSteps: QuestChainStep[];
} | null {
  for (const [chainId, steps] of questChainStepsByChainId.entries()) {
    const step = steps.find((s) => s.questId === questId);
    if (step) {
      const chain = questChainsById.get(chainId);
      if (chain) {
        return { chain, step, allSteps: steps };
      }
    }
  }
  return null;
}

export function buildChainWithSteps(chain: QuestChain, steps: QuestChainStep[]): QuestChainWithSteps {
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const populatedSteps = sortedSteps.map((s) => ({
    ...s,
    quest: getQuestById(s.questId),
  }));

  const totalSteps = populatedSteps.length;
  const completedSteps = populatedSteps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const currentStep = populatedSteps.find((s) => s.status === 'AVAILABLE') || populatedSteps[0];

  return {
    ...chain,
    steps: populatedSteps,
    totalSteps,
    completedSteps,
    progressPercent,
    currentStep,
  };
}

export const questChainRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /quest-chains - list user's quest chains with progression summary
  app.get('/quest-chains', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const userChains = getChainsByUserId(userId);
    const enriched = userChains.map((c) => {
      const steps = getStepsByChainId(c.id);
      return buildChainWithSteps(c, steps);
    });

    return reply.status(200).send(enriched);
  });

  // GET /quest-chains/:chainId - retrieve single quest chain details with steps
  app.get<{ Params: { chainId: string } }>('/quest-chains/:chainId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { chainId } = request.params;

    const chain = getChainById(chainId);
    if (!chain || chain.userId !== userId) {
      return reply.status(404).send({ error: 'Quest chain not found' });
    }

    const steps = getStepsByChainId(chainId);
    const result = buildChainWithSteps(chain, steps);
    return reply.status(200).send(result);
  });

  // POST /quest-chains - create a new quest chain with ordered steps
  app.post('/quest-chains', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const parsed = QuestChainCreationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { title, description, steps: rawSteps } = parsed.data;
    const chainId = 'chain-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const createdSteps: QuestChainStep[] = [];

    // Process and validate each step
    for (let i = 0; i < rawSteps.length; i++) {
      const stepItem = rawSteps[i];
      let questId: string;

      if (stepItem.questId) {
        const existingQuest = getQuestById(stepItem.questId);
        if (!existingQuest || existingQuest.userId !== userId) {
          return reply.status(400).send({
            error: `Quest at step ${i + 1} does not exist or does not belong to you.`,
          });
        }
        questId = existingQuest.id;
      } else {
        // Create quest for this step
        const newQuest: Quest = {
          id: 'quest-chain-' + Date.now() + '-' + (i + 1),
          userId,
          characterId: 'char-' + userId,
          title: stepItem.title,
          description: stepItem.description || '',
          category: stepItem.category,
          difficulty: stepItem.difficulty,
          xpReward: DIFFICULTY_XP_MAP[stepItem.difficulty] || 50,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveQuest(newQuest);
        questId = newQuest.id;
      }

      // First step is AVAILABLE; all subsequent steps start LOCKED!
      const status = i === 0 ? 'AVAILABLE' : 'LOCKED';

      createdSteps.push({
        id: 'step-' + Date.now() + '-' + (i + 1),
        chainId,
        questId,
        stepOrder: i + 1,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const newChain: QuestChain = {
      id: chainId,
      userId,
      title,
      description: description || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveChain(newChain);
    saveSteps(chainId, createdSteps);

    const fullResult = buildChainWithSteps(newChain, createdSteps);
    return reply.status(201).send(fullResult);
  });
};
