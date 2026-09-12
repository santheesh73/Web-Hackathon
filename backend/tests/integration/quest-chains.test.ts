import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('Quest Chains Integration Tests', () => {
  it('POST /quest-chains creates chain with Step 1 AVAILABLE and subsequent steps LOCKED', async () => {
    const app = buildApp();
    const userId = 'chain-creator-' + Date.now();

    const response = await app.inject({
      method: 'POST',
      url: '/quest-chains',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Full Stack Mastery',
        description: 'Learn frontend, backend, and deployment',
        steps: [
          { title: 'Learn Next.js 15', category: 'Learning', difficulty: 'Medium' },
          { title: 'Build Fastify API', category: 'Learning', difficulty: 'Medium' },
          { title: 'Deploy Production Cloud', category: 'Career', difficulty: 'Hard' },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    const chain = JSON.parse(response.body);
    expect(chain.title).toBe('Full Stack Mastery');
    expect(chain.status).toBe('ACTIVE');
    expect(chain.totalSteps).toBe(3);
    expect(chain.completedSteps).toBe(0);
    expect(chain.progressPercent).toBe(0);

    // Step 1 must be AVAILABLE, Steps 2 and 3 must be LOCKED
    expect(chain.steps[0].stepOrder).toBe(1);
    expect(chain.steps[0].status).toBe('AVAILABLE');
    expect(chain.steps[1].stepOrder).toBe(2);
    expect(chain.steps[1].status).toBe('LOCKED');
    expect(chain.steps[2].stepOrder).toBe(3);
    expect(chain.steps[2].status).toBe('LOCKED');
  });

  it('enforces sequential locking: locked steps cannot be completed directly', async () => {
    const app = buildApp();
    const userId = 'lock-tester-' + Date.now();

    // 1. Create a 3-step chain
    const chainRes = await app.inject({
      method: 'POST',
      url: '/quest-chains',
      headers: { authorization: `Bearer ${userId}` },
      payload: {
        title: 'Sequential Chain Test',
        steps: [
          { title: 'Step 1: First Task', category: 'Learning', difficulty: 'Easy' },
          { title: 'Step 2: Second Task', category: 'Learning', difficulty: 'Medium' },
          { title: 'Step 3: Third Task', category: 'Learning', difficulty: 'Hard' },
        ],
      },
    });
    const chain = JSON.parse(chainRes.body);
    const step1QuestId = chain.steps[0].questId;
    const step2QuestId = chain.steps[1].questId;
    const step3QuestId = chain.steps[2].questId;

    // 2. Direct attempt to complete locked Step 3: Must be rejected with 400
    const prematureRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: step3QuestId },
    });
    expect(prematureRes.statusCode).toBe(400);
    expect(JSON.parse(prematureRes.body).error).toContain('locked');

    // 3. Complete Step 1: Success -> Unlocks Step 2
    const c1Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: step1QuestId },
    });
    expect(c1Res.statusCode).toBe(200);
    const c1 = JSON.parse(c1Res.body);
    expect(c1.chainProgress.completedStepOrder).toBe(1);
    expect(c1.chainProgress.isChainCompleted).toBe(false);
    expect(c1.chainProgress.nextStepOrder).toBe(2);

    // Verify Step 2 is now AVAILABLE and Step 3 is still LOCKED
    const fetchAfterStep1 = await app.inject({
      method: 'GET',
      url: `/quest-chains/${chain.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const stateAfterStep1 = JSON.parse(fetchAfterStep1.body);
    expect(stateAfterStep1.steps[0].status).toBe('COMPLETED');
    expect(stateAfterStep1.steps[1].status).toBe('AVAILABLE');
    expect(stateAfterStep1.steps[2].status).toBe('LOCKED');
    expect(stateAfterStep1.completedSteps).toBe(1);

    // 4. Complete Step 2: Success -> Unlocks Step 3
    const c2Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: step2QuestId },
    });
    expect(c2Res.statusCode).toBe(200);

    // 5. Complete Step 3: Success -> Completes the entire chain
    const c3Res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${userId}` },
      payload: { questId: step3QuestId },
    });
    expect(c3Res.statusCode).toBe(200);
    const c3 = JSON.parse(c3Res.body);
    expect(c3.chainProgress.isChainCompleted).toBe(true);

    // Final verification: Chain is COMPLETED with 100% progress
    const finalRes = await app.inject({
      method: 'GET',
      url: `/quest-chains/${chain.id}`,
      headers: { authorization: `Bearer ${userId}` },
    });
    const finalChain = JSON.parse(finalRes.body);
    expect(finalChain.status).toBe('COMPLETED');
    expect(finalChain.completedSteps).toBe(3);
    expect(finalChain.progressPercent).toBe(100);
  });

  it('rejects cross-user access: User A cannot view User B chain', async () => {
    const app = buildApp();
    const userA = 'user-a-' + Date.now();
    const userB = 'user-b-' + Date.now();

    const createdRes = await app.inject({
      method: 'POST',
      url: '/quest-chains',
      headers: { authorization: `Bearer ${userA}` },
      payload: {
        title: 'Secret Chain',
        steps: [
          { title: 'Step 1', category: 'Health', difficulty: 'Easy' },
          { title: 'Step 2', category: 'Health', difficulty: 'Easy' },
        ],
      },
    });
    const chain = JSON.parse(createdRes.body);

    // User B attempts to access User A's chain -> 404 Not Found
    const unauthorizedRes = await app.inject({
      method: 'GET',
      url: `/quest-chains/${chain.id}`,
      headers: { authorization: `Bearer ${userB}` },
    });
    expect(unauthorizedRes.statusCode).toBe(404);
  });
});
