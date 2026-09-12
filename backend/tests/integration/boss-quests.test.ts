import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app';
import { clearBossStore } from '../../src/modules/boss-quests/routes';

describe('Boss Quests Integration Tests', () => {
  const app = buildApp();

  beforeEach(() => {
    clearBossStore();
  });

  it('POST /boss-quests creates a Boss Quest with server-assigned reward XP', async () => {
    const userId = 'boss-tester-' + Date.now();

    const res = await app.inject({
      method: 'POST',
      url: '/boss-quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Launch My Portfolio',
        description: 'Complete all steps to publish portfolio website',
        difficulty: 'Epic',
        rewardXp: 999999, // Should be ignored; Epic must be 500 XP
        objectives: [
          { title: 'Design System', requiredProgress: 1 },
          { title: 'Frontend Implementation', requiredProgress: 2 },
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.title).toBe('Launch My Portfolio');
    expect(body.difficulty).toBe('Epic');
    expect(body.rewardXp).toBe(500); // Server-authoritative
    expect(body.status).toBe('ACTIVE');
    expect(body.objectives.length).toBe(2);
    expect(body.progressPercent).toBe(0);
    expect(body.isDefeated).toBe(false);
  });

  it('allows objective management (create, update, delete) while active', async () => {
    const userId = 'boss-mgmt-' + Date.now();

    // 1. Create boss
    const createRes = await app.inject({
      method: 'POST',
      url: '/boss-quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Learn Full-Stack',
        difficulty: 'Rare',
        objectives: [{ title: 'Learn TypeScript', requiredProgress: 1 }],
      },
    });
    const boss = JSON.parse(createRes.body);

    // 2. Add objective
    const addObjRes = await app.inject({
      method: 'POST',
      url: `/boss-quests/${boss.id}/objectives`,
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Learn PostgreSQL',
        requiredProgress: 1,
      },
    });
    expect(addObjRes.statusCode).toBe(201);
    const addedObj = JSON.parse(addObjRes.body);

    // 3. Update objective
    const updateObjRes = await app.inject({
      method: 'PATCH',
      url: `/boss-quests/${boss.id}/objectives/${addedObj.id}`,
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Master PostgreSQL Queries',
        requiredProgress: 2,
      },
    });
    expect(updateObjRes.statusCode).toBe(200);
    const updatedObj = JSON.parse(updateObjRes.body);
    expect(updatedObj.title).toBe('Master PostgreSQL Queries');
    expect(updatedObj.requiredProgress).toBe(2);

    // 4. Verify boss details contains both objectives
    const getRes = await app.inject({
      method: 'GET',
      url: `/boss-quests/${boss.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const detailed = JSON.parse(getRes.body);
    expect(detailed.objectives.length).toBe(2);

    // 5. Delete objective
    const delRes = await app.inject({
      method: 'DELETE',
      url: `/boss-quests/${boss.id}/objectives/${addedObj.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(delRes.statusCode).toBe(200);

    const getRes2 = await app.inject({
      method: 'GET',
      url: `/boss-quests/${boss.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const detailed2 = JSON.parse(getRes2.body);
    expect(detailed2.objectives.length).toBe(1);
  });

  it('links quests to objectives and prevents duplicate quest links', async () => {
    const userId = 'boss-linker-' + Date.now();

    // 1. Create boss
    const createRes = await app.inject({
      method: 'POST',
      url: '/boss-quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Pass Certification Exam',
        difficulty: 'Legendary',
        objectives: [{ title: 'Complete Practice Exams', requiredProgress: 2 }],
      },
    });
    const boss = JSON.parse(createRes.body);
    const objId = boss.objectives[0].id;

    // 2. Create quest
    const qRes = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Practice Test A',
        category: 'Learning',
        difficulty: 'Hard',
      },
    });
    const quest = JSON.parse(qRes.body);

    // 3. Link quest to objective
    const linkRes = await app.inject({
      method: 'POST',
      url: `/boss-quests/${boss.id}/link-quest`,
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        questId: quest.id,
        objectiveId: objId,
      },
    });
    expect(linkRes.statusCode).toBe(201);

    // 4. Duplicate link attempt -> Expect 409 Conflict
    const dupRes = await app.inject({
      method: 'POST',
      url: `/boss-quests/${boss.id}/link-quest`,
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        questId: quest.id,
        objectiveId: objId,
      },
    });
    expect(dupRes.statusCode).toBe(409);
    expect(JSON.parse(dupRes.body).error).toContain('already linked');
  });

  it('completing linked quests updates objective and defeats boss with XP award atomically', async () => {
    const userId = 'boss-prog-' + Date.now();

    // 1. Create boss with 2 objectives
    const createRes = await app.inject({
      method: 'POST',
      url: '/boss-quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Launch My Portfolio',
        difficulty: 'Epic', // +500 XP reward upon defeat
        objectives: [
          { title: 'Design Section', requiredProgress: 1 },
          { title: 'Deploy Section', requiredProgress: 1 },
        ],
      },
    });
    const boss = JSON.parse(createRes.body);
    const obj1 = boss.objectives[0];
    const obj2 = boss.objectives[1];

    // 2. Create two quests
    const q1Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: { title: 'Design Hero Banner', category: 'Creativity', difficulty: 'Medium' }, // 50 XP
    });
    const quest1 = JSON.parse(q1Res.body);

    const q2Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: { title: 'Deploy to Vercel', category: 'Career', difficulty: 'Medium' }, // 50 XP
    });
    const quest2 = JSON.parse(q2Res.body);

    // 3. Link quest 1 to obj1, quest 2 to obj2
    await app.inject({
      method: 'POST',
      url: `/boss-quests/${boss.id}/link-quest`,
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest1.id, objectiveId: obj1.id },
    });

    await app.inject({
      method: 'POST',
      url: `/boss-quests/${boss.id}/link-quest`,
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest2.id, objectiveId: obj2.id },
    });

    // 4. Complete Quest 1 -> Objective 1 completes; Boss progress goes to 50%
    const comp1Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest1.id },
    });
    expect(comp1Res.statusCode).toBe(200);
    const comp1 = JSON.parse(comp1Res.body);
    expect(comp1.bossDefeat).toBeNull(); // Boss not yet defeated
    expect(comp1.character.xp).toBe(50); // 50 XP from quest 1

    // Check boss state
    const bossCheck1 = await app.inject({
      method: 'GET',
      url: `/boss-quests/${boss.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const bossData1 = JSON.parse(bossCheck1.body);
    expect(bossData1.progressPercent).toBe(50);
    expect(bossData1.objectives[0].isCompleted).toBe(true);
    expect(bossData1.objectives[1].isCompleted).toBe(false);
    expect(bossData1.status).toBe('ACTIVE');

    // 5. Complete Quest 2 -> Objective 2 completes; Boss defeated!
    const comp2Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest2.id },
    });
    expect(comp2Res.statusCode).toBe(200);
    const comp2 = JSON.parse(comp2Res.body);

    // Boss Defeat verified!
    expect(comp2.bossDefeat).not.toBeNull();
    expect(comp2.bossDefeat.bossId).toBe(boss.id);
    expect(comp2.bossDefeat.bossTitle).toBe('Launch My Portfolio');
    expect(comp2.bossDefeat.rewardXp).toBe(500); // 500 XP from Epic boss!
    expect(comp2.bossDefeat.defeated).toBe(true);

    // Total character XP = 50 (q1) + 50 (q2) + 500 (boss) = 600 XP!
    expect(comp2.character.xp).toBe(600);
    expect(comp2.character.level).toBeGreaterThanOrEqual(4); // 600 XP reaches level 4+

    // Check boss is marked COMPLETED
    const bossCheck2 = await app.inject({
      method: 'GET',
      url: `/boss-quests/${boss.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const bossData2 = JSON.parse(bossCheck2.body);
    expect(bossData2.status).toBe('COMPLETED');
    expect(bossData2.progressPercent).toBe(100);
    expect(bossData2.isDefeated).toBe(true);

    // 6. Prevent modification of completed Boss
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/boss-quests/${boss.id}`,
      headers: { authorization: `Bearer ${userId}` },
      payload: { title: 'Renamed' },
    });
    expect(patchRes.statusCode).toBe(400);
    expect(JSON.parse(patchRes.body).error).toContain('Cannot modify a completed Boss Quest');

    // 7. Duplicate completion attempt on Quest 2 is strictly rejected
    const dupCompRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest2.id },
    });
    expect(dupCompRes.statusCode).toBe(409);
  });

  describe('Security & Authorization Tests', () => {
    it('User A cannot access or modify User B Boss Quest', async () => {
      const userA = 'user-a-' + Date.now();
      const userB = 'user-b-' + Date.now();

      // Create boss as User A
      const createRes = await app.inject({
        method: 'POST',
        url: '/boss-quests',
        headers: { authorization: `Bearer ${userA}` },
        payload: {
          title: 'User A Secret Boss',
          difficulty: 'Legendary',
          objectives: [{ title: 'Secret Step', requiredProgress: 1 }],
        },
      });
      const boss = JSON.parse(createRes.body);

      // User B attempts to read User A boss
      const getRes = await app.inject({
        method: 'GET',
        url: `/boss-quests/${boss.id}`,
        headers: { authorization: `Bearer ${userB}` },
      });
      expect(getRes.statusCode).toBe(404);

      // User B attempts to patch User A boss
      const patchRes = await app.inject({
        method: 'PATCH',
        url: `/boss-quests/${boss.id}`,
        headers: { authorization: `Bearer ${userB}` },
        payload: { title: 'Hacked Title' },
      });
      expect(patchRes.statusCode).toBe(404);

      // User B attempts to link their own quest to User A boss
      const linkRes = await app.inject({
        method: 'POST',
        url: `/boss-quests/${boss.id}/link-quest`,
        headers: { authorization: `Bearer ${userB}` },
        payload: {
          questId: 'fake-quest',
          objectiveId: boss.objectives[0].id,
        },
      });
      expect(linkRes.statusCode).toBe(404);
    });

    it('User A cannot link User B quest to User A boss', async () => {
      const userA = 'user-a2-' + Date.now();
      const userB = 'user-b2-' + Date.now();

      // User A creates boss
      const bRes = await app.inject({
        method: 'POST',
        url: '/boss-quests',
        headers: { authorization: `Bearer ${userA}` },
        payload: {
          title: 'User A Boss',
          difficulty: 'Rare',
          objectives: [{ title: 'Obj 1', requiredProgress: 1 }],
        },
      });
      const boss = JSON.parse(bRes.body);

      // User B creates quest
      const qRes = await app.inject({
        method: 'POST',
        url: '/quests',
        headers: { authorization: `Bearer ${userB}` },
        payload: { title: 'User B Quest', category: 'Health', difficulty: 'Easy' },
      });
      const quest = JSON.parse(qRes.body);

      // User A attempts to link User B quest
      const linkRes = await app.inject({
        method: 'POST',
        url: `/boss-quests/${boss.id}/link-quest`,
        headers: { authorization: `Bearer ${userA}` },
        payload: {
          questId: quest.id,
          objectiveId: boss.objectives[0].id,
        },
      });
      expect(linkRes.statusCode).toBe(404);
      expect(JSON.parse(linkRes.body).error).toContain('not found or unauthorized');
    });
  });
});
