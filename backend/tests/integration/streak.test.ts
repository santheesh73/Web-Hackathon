import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';
import { getOrCreateStreak, saveStreak, getUtcDayBeforeYesterdayString } from '../../src/modules/streak/routes';

describe('Streak & Calendar Integration Tests', () => {
  it('GET /streak returns initial streak state for new user', async () => {
    const app = buildApp();
    const userId = 'streak-new-user-' + Date.now();

    const response = await app.inject({
      method: 'GET',
      url: '/streak',
      headers: { authorization: `Bearer ${userId}` },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.streak.currentStreak).toBe(0);
    expect(body.streak.longestStreak).toBe(0);
    expect(body.streak.recoveryAvailable).toBe(true);
    expect(body.status).toBe('NONE');
    expect(body.isAtRisk).toBe(false);
  });

  it('completing first quest of the day initializes streak to 1', async () => {
    const app = buildApp();
    const userId = 'streak-first-day-' + Date.now();

    // Create quest
    const qRes = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Morning Meditation',
        category: 'Personal',
        difficulty: 'Easy',
      },
    });
    const quest = JSON.parse(qRes.body);

    // Complete quest
    const compRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: quest.id },
    });

    expect(compRes.statusCode).toBe(200);
    const compBody = JSON.parse(compRes.body);
    expect(compBody.streak.currentStreak).toBe(1);
    expect(compBody.streak.longestStreak).toBe(1);
    expect(compBody.streak.firstToday).toBe(true);

    // Verify GET /streak reflects active state
    const streakRes = await app.inject({
      method: 'GET',
      url: '/streak',
      headers: { authorization: `Bearer ${userId}` },
    });
    const streakBody = JSON.parse(streakRes.body);
    expect(streakBody.streak.currentStreak).toBe(1);
    expect(streakBody.status).toBe('ACTIVE');
  });

  it('completing multiple quests on the same day only counts once toward streak', async () => {
    const app = buildApp();
    const userId = 'same-day-streak-user-' + Date.now();

    // Quest 1
    const q1Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: { title: 'First Task', category: 'Health', difficulty: 'Easy' },
    });
    const q1 = JSON.parse(q1Res.body);

    // Quest 2
    const q2Res = await app.inject({
      method: 'POST',
      url: '/quests',
      headers: { authorization: `Bearer ${userId}` },
      payload: { title: 'Second Task', category: 'Career', difficulty: 'Medium' },
    });
    const q2 = JSON.parse(q2Res.body);

    // Complete Quest 1 -> first today
    const c1Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: q1.id },
    });
    const c1 = JSON.parse(c1Res.body);
    expect(c1.streak.currentStreak).toBe(1);
    expect(c1.streak.firstToday).toBe(true);

    // Complete Quest 2 -> second today: streak count must NOT increment
    const c2Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: q2.id },
    });
    const c2 = JSON.parse(c2Res.body);
    expect(c2.streak.currentStreak).toBe(1);
    expect(c2.streak.firstToday).toBe(false);

    // Calendar verifies 2 quests completed on today's active date
    const calRes = await app.inject({
      method: 'GET',
      url: '/streak/calendar?days=7',
      headers: { authorization: `Bearer ${userId}` },
    });
    const cal = JSON.parse(calRes.body);
    const todayEntry = cal.find((d: { isToday: boolean; active: boolean; count: number }) => d.isToday);
    expect(todayEntry.active).toBe(true);
    expect(todayEntry.count).toBe(2);
  });

  it('handles streak recovery: rejects ineligible, restores when eligible, rejects duplicate', async () => {
    const app = buildApp();
    const userId = 'recovery-test-user-' + Date.now();

    // 1. New user has not missed yesterday -> not eligible
    const ineligRes = await app.inject({
      method: 'POST',
      url: '/streak/recover',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(ineligRes.statusCode).toBe(400);

    // 2. Set user streak to simulate having active streak with last activity 2 days ago
    const dayBeforeYesterday = getUtcDayBeforeYesterdayString();
    const streak = getOrCreateStreak(userId);
    streak.currentStreak = 5;
    streak.longestStreak = 5;
    streak.lastActivityDate = dayBeforeYesterday;
    streak.recoveryAvailable = true;
    saveStreak(streak);

    // Verify GET /streak reports AT_RISK
    const statusRes = await app.inject({
      method: 'GET',
      url: '/streak',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(JSON.parse(statusRes.body).status).toBe('AT_RISK');
    expect(JSON.parse(statusRes.body).isAtRisk).toBe(true);

    // 3. Execute recovery
    const recoverRes = await app.inject({
      method: 'POST',
      url: '/streak/recover',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(recoverRes.statusCode).toBe(200);
    const recoverBody = JSON.parse(recoverRes.body);
    expect(recoverBody.success).toBe(true);
    expect(recoverBody.newStreak).toBe(6); // 5 + 1
    expect(recoverBody.recoveryAvailable).toBe(false);

    // 4. Duplicate recovery attempt: Must be rejected with 409 Conflict
    const dupRecoverRes = await app.inject({
      method: 'POST',
      url: '/streak/recover',
      headers: { authorization: `Bearer ${userId}` },
    });
    expect(dupRecoverRes.statusCode).toBe(409);
    expect(JSON.parse(dupRecoverRes.body).error).toContain('already been used');
  });
});
