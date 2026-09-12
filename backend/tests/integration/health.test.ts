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
});
