import { buildApp } from './app';
import { env } from './config/env';

const app = buildApp();

async function start() {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`LIFE RPG API listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
