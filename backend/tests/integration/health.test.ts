import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('Health Endpoint (GET /health)', () => {
  it('returns 200 with status ok and service life-rpg-api', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      status: 'ok',
      service: 'life-rpg-api',
    });
  });

  it('GET / returns 200 with service info for JSON clients', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: { accept: 'application/json' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.service).toBe('life-rpg-api');
    expect(body.status).toBe('ok');
    expect(body.frontend).toBe('http://localhost:3000');
  });

  it('GET / returns 200 HTML redirect portal for browser requests', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: { accept: 'text/html,application/xhtml+xml' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.body).toContain('http://localhost:3000/');
  });
});
