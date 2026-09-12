import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { saveCharacter } from '../../src/modules/character/routes';
import { resetQuestsStore, saveQuest } from '../../src/modules/quests/routes';
import { resetRewardsStore, getShopItems } from '../../src/modules/rewards/routes';
import type { Character } from '@shared/types/character';

describe('Shop and Economy Integration Tests', () => {
  let app: FastifyInstance;
  const testUserId = 'test-economy-user';
  const testCharId = 'char-economy-1';

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
    resetQuestsStore();
    resetRewardsStore();

    // Seed test character with 0 gold
    const testCharacter: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Economy Hero',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 0,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(testCharacter);
  });

  it('GET /shop returns active items with isOwned: false initially', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/shop',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const items = JSON.parse(res.payload);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.isOwned).toBe(false);
      expect(item.isActive).toBe(true);
    }
  });

  it('GET /shop?category=THEME filters items by category', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/shop?category=THEME',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const items = JSON.parse(res.payload);
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.category).toBe('THEME');
    }
  });

  it('POST /quest-completion awards gold and logs an EARN transaction', async () => {
    // Save an active quest for the user
    saveQuest({
      id: 'quest-econ-1',
      userId: testUserId,
      characterId: testCharId,
      title: 'Complete Hackathon Module',
      category: 'Career',
      difficulty: 'Hard', // Hard awards 25 Gold
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-econ-1' },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.goldAwarded).toBe(25);
    expect(body.totalGold).toBe(25);
    expect(body.character.gold).toBe(25);

    // Verify ledger entry in /economy/transactions
    const txRes = await app.inject({
      method: 'GET',
      url: '/economy/transactions',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(txRes.statusCode).toBe(200);
    const txs = JSON.parse(txRes.payload);
    expect(txs.length).toBe(1);
    expect(txs[0].type).toBe('EARN');
    expect(txs[0].amount).toBe(25);
    expect(txs[0].source).toBe('QUEST_COMPLETION');
    expect(txs[0].referenceId).toBe('quest-econ-1');
  });

  it('rejects purchase when gold balance is insufficient', async () => {
    const allItems = getShopItems();
    const item100 = allItems.find((i) => i.price === 100);
    expect(item100).toBeDefined();

    // Character currently has 0 gold
    const res = await app.inject({
      method: 'POST',
      url: `/shop/${item100!.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('Insufficient gold');
    expect(body.required).toBe(100);
    expect(body.available).toBe(0);
  });

  it('allows purchase when balance is sufficient, deducts gold, and records SPEND ledger', async () => {
    const allItems = getShopItems();
    const item75 = allItems.find((i) => i.price === 75);
    expect(item75).toBeDefined();

    // Grant character 100 gold
    const char: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Economy Hero',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 100,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(char);

    const res = await app.inject({
      method: 'POST',
      url: `/shop/${item75!.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.remainingGold).toBe(25); // 100 - 75 = 25
    expect(body.purchase.itemId).toBe(item75!.id);
    expect(body.purchase.pricePaid).toBe(75);

    // Verify GET /shop now marks item as isOwned: true
    const shopRes = await app.inject({
      method: 'GET',
      url: `/shop/${item75!.id}`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const updatedItem = JSON.parse(shopRes.payload);
    expect(updatedItem.isOwned).toBe(true);

    // Verify SPEND ledger transaction
    const txRes = await app.inject({
      method: 'GET',
      url: '/economy/transactions',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const txs = JSON.parse(txRes.payload);
    const spendTx = txs.find((t: { type: string }) => t.type === 'SPEND');
    expect(spendTx).toBeDefined();
    expect(spendTx.amount).toBe(75);
    expect(spendTx.balanceAfter).toBe(25);
    expect(spendTx.source).toBe('SHOP_PURCHASE');
  });

  it('rejects duplicate purchases of already owned items', async () => {
    const allItems = getShopItems();
    const item30 = allItems.find((i) => i.price === 30);
    expect(item30).toBeDefined();

    // Give character 200 gold
    const char: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Economy Hero',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 200,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(char);

    // First purchase succeeds
    const res1 = await app.inject({
      method: 'POST',
      url: `/shop/${item30!.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    expect(res1.statusCode).toBe(200);

    // Second purchase of same item is rejected with 409 Conflict
    const res2 = await app.inject({
      method: 'POST',
      url: `/shop/${item30!.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    expect(res2.statusCode).toBe(409);
    const body2 = JSON.parse(res2.payload);
    expect(body2.error).toContain('already owned');
  });

  it('enforces concurrency protection against race conditions (double spend)', async () => {
    const allItems = getShopItems();
    // Pick two distinct items costing 60 each (theme-neon-matrix and badge-discipline-master)
    const items60 = allItems.filter((i) => i.price === 60);
    expect(items60.length).toBeGreaterThanOrEqual(2);
    const itemA = items60[0];
    const itemB = items60[1];

    // Give user 100 gold (enough for ONE 60 gold item, but NOT both 60+60=120)
    const char: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Concurrency Hero',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 100,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(char);

    // Launch both purchases concurrently
    const [resA, resB] = await Promise.all([
      app.inject({
        method: 'POST',
        url: `/shop/${itemA.id}/purchase`,
        headers: { authorization: `Bearer ${testUserId}` },
      }),
      app.inject({
        method: 'POST',
        url: `/shop/${itemB.id}/purchase`,
        headers: { authorization: `Bearer ${testUserId}` },
      }),
    ]);

    const statusCodes = [resA.statusCode, resB.statusCode].sort();
    // One must be 200 (Success) and one must be 400 (Insufficient gold)
    expect(statusCodes).toEqual([200, 400]);

    // Check final character balance: exactly 40 Gold remaining (100 - 60)
    const charRes = await app.inject({
      method: 'GET',
      url: '/character',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const updatedChar = JSON.parse(charRes.payload);
    expect(updatedChar.gold).toBe(40);

    // Verify exactly 1 SPEND transaction was logged
    const txRes = await app.inject({
      method: 'GET',
      url: '/economy/transactions',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const txs = JSON.parse(txRes.payload);
    const spendTxs = txs.filter((t: { type: string }) => t.type === 'SPEND');
    expect(spendTxs.length).toBe(1);
    expect(spendTxs[0].amount).toBe(60);
    expect(spendTxs[0].balanceAfter).toBe(40);
  });

  it('isolates user purchases and transactions across accounts', async () => {
    const userA = 'user-a';
    const userB = 'user-b';
    const allItems = getShopItems();
    const item30 = allItems.find((i) => i.price === 30)!;

    // Create characters
    saveCharacter({
      id: 'char-a',
      userId: userA,
      name: 'User A',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 100,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    saveCharacter({
      id: 'char-b',
      userId: userB,
      name: 'User B',
      avatar: 'solar-paladin',
      lifeFocus: 'health',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 100,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // User A purchases item30
    await app.inject({
      method: 'POST',
      url: `/shop/${item30.id}/purchase`,
      headers: { authorization: `Bearer ${userA}` },
    });

    // User A sees item30 as owned
    const shopARes = await app.inject({
      method: 'GET',
      url: `/shop/${item30.id}`,
      headers: { authorization: `Bearer ${userA}` },
    });
    expect(JSON.parse(shopARes.payload).isOwned).toBe(true);

    // User B DOES NOT see item30 as owned
    const shopBRes = await app.inject({
      method: 'GET',
      url: `/shop/${item30.id}`,
      headers: { authorization: `Bearer ${userB}` },
    });
    expect(JSON.parse(shopBRes.payload).isOwned).toBe(false);

    // User B has 0 transactions
    const txBRes = await app.inject({
      method: 'GET',
      url: '/economy/transactions',
      headers: { authorization: `Bearer ${userB}` },
    });
    expect(JSON.parse(txBRes.payload).length).toBe(0);
  });
});
