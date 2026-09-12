import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { saveCharacter } from '../../src/modules/character/routes';
import { resetQuestsStore, saveQuest } from '../../src/modules/quests/routes';
import { resetAchievementsStore } from '../../src/modules/achievements/routes';
import { resetRewardsStore, getShopItems } from '../../src/modules/rewards/routes';
import { equipItemForCharacter } from '../../src/modules/inventory/routes';
import type { Character } from '@shared/types/character';
import type { AchievementWithProgress, AchievementsSummary } from '@shared/types/achievement';

describe('Achievements Integration Tests', () => {
  let app: FastifyInstance;
  const testUserId = 'test-ach-user-1';
  const testCharId = 'char-ach-1';

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
    resetQuestsStore();
    resetAchievementsStore();
    resetRewardsStore();

    const testCharacter: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Achiever Hero',
      avatar: 'scholar',
      lifeFocus: 'health',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 500,
      evolutionTier: 1,
      evolutionTitle: 'Initiate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(testCharacter);
  });

  it('GET /achievements returns 14 catalog items with 0 progress for new character', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const achievements: AchievementWithProgress[] = JSON.parse(res.payload);
    expect(achievements.length).toBe(14);

    for (const ach of achievements) {
      if (ach.requirementType === 'PLAYER_LEVEL') {
        expect(ach.progress).toBe(1);
      } else {
        expect(ach.progress).toBe(0);
      }
      expect(ach.isUnlocked).toBe(false);
      expect(ach.unlockedAt).toBeNull();
    }
  });

  it('GET /achievements/summary returns accurate counters', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/achievements/summary',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const summary: AchievementsSummary = JSON.parse(res.payload);
    expect(summary.total).toBe(14);
    expect(summary.unlockedCount).toBe(0);
    expect(summary.inProgressCount).toBe(2); // Level 5 and Level 10 tracking at Level 1
    expect(summary.lockedCount).toBe(12);
    expect(summary.completionPercent).toBe(0);
  });

  it('completing a quest unlocks FIRST_QUEST achievement and returns it in completion payload', async () => {
    saveQuest({
      id: 'quest-ach-1',
      userId: testUserId,
      characterId: testCharId,
      title: 'Complete Morning Run',
      category: 'Health',
      difficulty: 'Hard',
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const compRes = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-ach-1' },
    });

    expect(compRes.statusCode).toBe(200);
    const compBody = JSON.parse(compRes.payload);

    // Verify achievement was unlocked and returned in payload
    expect(compBody.unlockedAchievements).toBeDefined();
    expect(compBody.unlockedAchievements.length).toBeGreaterThanOrEqual(1);
    const firstQuestAch = compBody.unlockedAchievements.find(
      (a: { key: string }) => a.key === 'FIRST_QUEST'
    );
    expect(firstQuestAch).toBeDefined();

    // Verify GET /achievements reflects unlocked state
    const achRes = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const achievements: AchievementWithProgress[] = JSON.parse(achRes.payload);
    const firstQuestInCatalog = achievements.find((a) => a.key === 'FIRST_QUEST');
    expect(firstQuestInCatalog?.isUnlocked).toBe(true);
    expect(firstQuestInCatalog?.progress).toBe(1);
    expect(firstQuestInCatalog?.unlockedAt).not.toBeNull();
    expect(firstQuestInCatalog?.progressPercent).toBe(100);
  });

  it('GET /achievements with status filter returns only unlocked achievements', async () => {
    // Complete 1 quest
    saveQuest({
      id: 'quest-ach-filter',
      userId: testUserId,
      characterId: testCharId,
      title: 'Reading chapter',
      category: 'Learning',
      difficulty: 'Medium',
      xpReward: 50,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-ach-filter' },
    });

    const res = await app.inject({
      method: 'GET',
      url: '/achievements?status=UNLOCKED',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const unlocked: AchievementWithProgress[] = JSON.parse(res.payload);
    expect(unlocked.length).toBeGreaterThanOrEqual(1);
    for (const ach of unlocked) {
      expect(ach.isUnlocked).toBe(true);
    }
  });

  it('duplicate events do not alter unlockedAt or create duplicate user achievement records', async () => {
    saveQuest({
      id: 'quest-ach-dup-1',
      userId: testUserId,
      characterId: testCharId,
      title: 'Run 5K',
      category: 'Health',
      difficulty: 'Hard',
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-ach-dup-1' },
    });

    const initialRes = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const initialList: AchievementWithProgress[] = JSON.parse(initialRes.payload);
    const initialUnlockedAt = initialList.find((a) => a.key === 'FIRST_QUEST')?.unlockedAt;
    expect(initialUnlockedAt).toBeDefined();

    // Complete second quest
    saveQuest({
      id: 'quest-ach-dup-2',
      userId: testUserId,
      characterId: testCharId,
      title: 'Hydrate properly',
      category: 'Health',
      difficulty: 'Easy',
      xpReward: 25,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-ach-dup-2' },
    });

    const secondRes = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const secondList: AchievementWithProgress[] = JSON.parse(secondRes.payload);
    const secondUnlockedAt = secondList.find((a) => a.key === 'FIRST_QUEST')?.unlockedAt;

    // unlockedAt remains identical (not overwritten)
    expect(secondUnlockedAt).toBe(initialUnlockedAt);
  });

  it('cross-user security: User B cannot see User A achievement state', async () => {
    // User A completes a quest and unlocks FIRST_QUEST
    saveQuest({
      id: 'quest-user-a',
      userId: testUserId,
      characterId: testCharId,
      title: 'User A Task',
      category: 'Career',
      difficulty: 'Hard',
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: { authorization: `Bearer ${testUserId}` },
      payload: { questId: 'quest-user-a' },
    });

    // User B registers
    const userB = 'test-ach-user-2';
    saveCharacter({
      id: 'char-user-b',
      userId: userB,
      name: 'User B Hero',
      avatar: 'warrior',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 0,
      evolutionTier: 1,
      evolutionTitle: 'Initiate',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const resB = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${userB}` },
    });
    const listB: AchievementWithProgress[] = JSON.parse(resB.payload);
    const firstQuestForB = listB.find((a) => a.key === 'FIRST_QUEST');
    expect(firstQuestForB?.isUnlocked).toBe(false);
    expect(firstQuestForB?.progress).toBe(0);
  });

  it('purchasing and equipping items unlocks ITEM_COUNT and EQUIPPED_ITEM_COUNT achievements', async () => {
    const allShopItems = getShopItems();
    const avatarItem = allShopItems.find((i) => i.category === 'AVATAR')!;

    // 1. Purchase item
    const pRes = await app.inject({
      method: 'POST',
      url: `/shop/${avatarItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    expect(pRes.statusCode).toBe(200);

    // Verify FIRST_PURCHASE unlocked
    const achRes1 = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const list1: AchievementWithProgress[] = JSON.parse(achRes1.payload);
    const purchaseAch = list1.find((a) => a.key === 'FIRST_PURCHASE');
    expect(purchaseAch?.isUnlocked).toBe(true);

    // 2. Equip item
    equipItemForCharacter(testCharId, avatarItem, testUserId);

    // Verify FIRST_ITEM_EQUIPPED unlocked
    const achRes2 = await app.inject({
      method: 'GET',
      url: '/achievements',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const list2: AchievementWithProgress[] = JSON.parse(achRes2.payload);
    const equipAch = list2.find((a) => a.key === 'FIRST_ITEM_EQUIPPED');
    expect(equipAch?.isUnlocked).toBe(true);
  });
});
