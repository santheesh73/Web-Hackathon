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
import { inventoryRoutes } from './modules/inventory/routes';
import { achievementRoutes } from './modules/achievements/routes';

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

  // Root endpoint: provides service status and guides browser visitors to the frontend app
  app.get('/', async (request, reply) => {
    const accept = request.headers.accept || '';
    if (accept.includes('text/html')) {
      return reply
        .type('text/html')
        .status(200)
        .send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=http://localhost:3000/" />
  <title>LIFE RPG API &bull; Redirecting to Web App...</title>
  <style>
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    h1 {
      font-size: 20px;
      margin: 0 0 8px 0;
      font-weight: 700;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: #4f46e5;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.15s;
    }
    .btn:hover {
      background: #4338ca;
    }
    .footnote {
      margin-top: 16px;
      font-size: 12px;
      color: #64748b;
    }
  </style>
  <script>window.location.href = "http://localhost:3000/";</script>
</head>
<body>
  <div class="card">
    <div class="badge">&#x25CF; Fastify API Live (Port 4000)</div>
    <h1>LIFE RPG Backend Engine</h1>
    <p>This port hosts the REST API and game progression engine. The interactive web application is running on port 3000.</p>
    <a href="http://localhost:3000/" class="btn">Launch LIFE RPG Web App &rarr;</a>
    <div class="footnote">Redirecting automatically...</div>
  </div>
</body>
</html>`);
    }

    return reply.status(200).send({
      service: 'life-rpg-api',
      status: 'ok',
      version: '0.1.0',
      frontend: 'http://localhost:3000',
      health: 'http://localhost:4000/health',
      message: 'LIFE RPG Backend API is running. The web application is hosted at http://localhost:3000',
    });
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
  app.register(inventoryRoutes);
  app.register(achievementRoutes);

  return app;
}
