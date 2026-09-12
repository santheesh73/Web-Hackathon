import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('Quests & Progression Integration Tests', () => {
  it('POST /quests creates quest with server-authoritative XP assignment', async () => {
    const app = buildApp();
    const userId = 'quest-user-' + Date.now();

    // Attempt to spoof xpReward in payload
    const response = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: {
        authorization: `Bearer ${userId}`,
      },
      payload: {
        title: 'Morning 5km Run',
        description: 'Run through the park before work',
        category: 'Health',
        difficulty: 'Medium',
        xpReward: 999999, // Should be ignored by server!
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.title).toBe('Morning 5km Run');
    expect(body.category).toBe('Health');
    expect(body.difficulty).toBe('Medium');
    expect(body.xpReward).toBe(50); // Server-authoritative: Medium = 50 XP
    expect(body.status).toBe('ACTIVE');
  });

  it('GET /quests retrieves quests and filters by status', async () => {
    const app = buildApp();
    const userId = 'filter-user-' + Date.now();

    // Create 2 quests
    const q1Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Study TypeScript Generics',
        category: 'Learning',
        difficulty: 'Hard',
      },
    });
    expect(q1Res.statusCode).toBe(201);
    const q1 = JSON.parse(q1Res.body);

    const q2Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Drink 2L Water',
        category: 'Health',
        difficulty: 'Easy',
      },
    });
    expect(q2Res.statusCode).toBe(201);
    const q2 = JSON.parse(q2Res.body);

    // Complete q1
    const compRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: q1.id },
    });
    expect(compRes.statusCode).toBe(200);

    // Test GET /quests with no filter -> returns both
    const allRes = await app.inject({
      method: 'GET',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(allRes.statusCode).toBe(200);
    const all = JSON.parse(allRes.body);
    expect(all.length).toBe(2);

    // Test GET /quests?status=ACTIVE -> returns only q2
    const activeRes = await app.inject({
      method: 'GET',
      url: '/quests?status=ACTIVE',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(activeRes.statusCode).toBe(200);
    const active = JSON.parse(activeRes.body);
    expect(active.length).toBe(1);
    expect(active[0].id).toBe(q2.id);

    // Test GET /quests?status=COMPLETED -> returns only q1
    const completedRes = await app.inject({
      method: 'GET',
      url: '/quests?status=COMPLETED',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(completedRes.statusCode).toBe(200);
    const completed = JSON.parse(completedRes.body);
    expect(completed.length).toBe(1);
    expect(completed[0].id).toBe(q1.id);
  });

  it('GET /quests/:questId retrieves single quest or returns 404', async () => {
    const app = buildApp();
    const userId = 'single-user-' + Date.now();

    const createdRes = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Meditate for 15 mins',
        category: 'Personal',
        difficulty: 'Easy',
      },
    });
    expect(createdRes.statusCode).toBe(201);
    const created = JSON.parse(createdRes.body);

    // Valid retrieval
    const fetchRes = await app.inject({
      method: 'GET',
      url: `/quests/${created.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(fetchRes.statusCode).toBe(200);
    expect(JSON.parse(fetchRes.body).id).toBe(created.id);

    // Nonexistent quest
    const notFoundRes = await app.inject({
      method: 'GET',
      url: '/quests/non-existent-id',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(notFoundRes.statusCode).toBe(404);

    // Quest belonging to another user
    const otherUserRes = await app.inject({
      method: 'GET',
      url: `/quests/${created.id}`,
      headers: { authorization: 'Bearer other-user' },
    });
    expect(otherUserRes.statusCode).toBe(404);
  });

  it('POST /quest-completion completes quest, updates XP, and triggers level up', async () => {
    const app = buildApp();
    const userId = 'levelup-user-' + Date.now();

    // 1. Create a character for this user
    await app.inject({
      method: 'POST',
      url: '/character',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        name: 'ProgressionTester',
        avatar: 'scholar',
        lifeFocus: 'learning',
      },
    });

    // 2. Create a Hard quest (+100 XP)
    const questRes = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Pass System Design Exam',
        category: 'Career',
        difficulty: 'Hard',
      },
    });
    expect(questRes.statusCode).toBe(201);
    const quest = JSON.parse(questRes.body);

    // 3. Complete quest -> starting at 0 XP (Level 1), 100 XP reaches Level 2!
    const completionRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest.id },
    });

    expect(completionRes.statusCode).toBe(200);
    const result = JSON.parse(completionRes.body);

    expect(result.quest.status).toBe('COMPLETED');
    expect(result.xpAwarded).toBe(100);
    expect(result.previousLevel).toBe(1);
    expect(result.newLevel).toBe(2);
    expect(result.leveledUp).toBe(true);
    expect(result.character.xp).toBe(100);
    expect(result.character.level).toBe(2);
  });

  it('POST /quest-completion rejects duplicate completion with 409 Conflict', async () => {
    const app = buildApp();
    const userId = 'duplicate-test-user-' + Date.now();

    // 1. Create quest
    const questRes = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Clean the garage',
        category: 'Personal',
        difficulty: 'Medium',
      },
    });
    expect(questRes.statusCode).toBe(201);
    const quest = JSON.parse(questRes.body);

    // 2. First completion: Success
    const firstRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest.id },
    });
    expect(firstRes.statusCode).toBe(200);

    // 3. Duplicate completion: Should return 409 Conflict
    const secondRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest.id },
    });
    expect(secondRes.statusCode).toBe(409);
    const errBody = JSON.parse(secondRes.body);
    expect(errBody.error).toContain('already been completed');
  });
});
