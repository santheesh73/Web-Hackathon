import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { HealthResponseSchema } from '../../src/shared/schemas/health';
import { API_ROUTES } from '../../src/shared/constants/api';
import { characterRoutes } from './modules/character/routes';
import { questRoutes } from './modules/quests/routes';
import { progressionRoutes } from './modules/progression/routes';
import { streakRoutes } from './modules/streak/routes';
import { questChainRoutes } from './modules/quest-chains/routes';
import { attributeRoutes } from './modules/attributes/routes';
import { skillTreeRoutes } from './modules/skill-tree/routes';
import { bossQuestRoutes } from './modules/boss-quests/routes';
import { rewardRoutes } from './modules/rewards/routes';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: false,
  });

  app.register(cors, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Health endpoint
  app.get(API_ROUTES.HEALTH, async (_request, reply) => {
    const healthData = {
      status: 'ok' as const,
      service: 'life-rpg-api' as const,
    };

    const validated = HealthResponseSchema.parse(healthData);
    return reply.status(200).send(validated);
  });

  // Register Modules
  app.register(characterRoutes);
  app.register(questRoutes);
  app.register(progressionRoutes);
  app.register(streakRoutes);
  app.register(questChainRoutes);
  app.register(attributeRoutes);
  app.register(skillTreeRoutes);
  app.register(bossQuestRoutes);
  app.register(rewardRoutes);

  return app;
}
