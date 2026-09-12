import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('Character API Endpoints', () => {
  it('creates character on POST /character and returns 201', async () => {
    const app = buildApp();
    const testUserId = 'test-user-' + Date.now();

    const response = await app.inject({
      method: 'POST',
      url: '/character',
      headers: {
        authorization: `Bearer ${testUserId}`,
      },
      payload: {
        name: 'VanguardHero',
        avatar: 'warrior',
        lifeFocus: 'learning',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('VanguardHero');
    expect(body.userId).toBe(testUserId);
  });

  it('rejects duplicate character creation with 409 Conflict', async () => {
    const app = buildApp();
    const testUserId = 'test-duplicate-' + Date.now();

    // First creation
    await app.inject({
      method: 'POST',
      url: '/character',
      headers: {
        authorization: `Bearer ${testUserId}`,
      },
      payload: {
        name: 'FirstHero',
        avatar: 'scholar',
        lifeFocus: 'health',
      },
    });

    // Duplicate attempt
    const duplicateRes = await app.inject({
      method: 'POST',
      url: '/character',
      headers: {
        authorization: `Bearer ${testUserId}`,
      },
      payload: {
        name: 'SecondHero',
        avatar: 'scout',
        lifeFocus: 'career',
      },
    });

    expect(duplicateRes.statusCode).toBe(409);
    const body = JSON.parse(duplicateRes.body);
    expect(body.error).toContain('already exists');
  });
});
