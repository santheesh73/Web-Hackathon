import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app';
import { charactersByUserId } from '../../src/modules/character/routes';
import { questsById } from '../../src/modules/quests/routes';
import { attributesByUserId } from '../../src/modules/attributes/routes';
import { unlockedSkillsByUserId } from '../../src/modules/skill-tree/routes';
import { streaksByUserId, streakActivitiesByUserId } from '../../src/modules/streak/routes';
import type { Quest } from '../../../src/shared/types/quest';
import type { Character } from '../../../src/shared/types/character';

describe('Attributes, Skills & Evolution API (Integration)', () => {
  const app = buildApp();
  const testUserId = 'test-attr-user';
  const testHeaders = { authorization: `Bearer ${testUserId}` };

  beforeEach(() => {
    charactersByUserId.clear();
    questsById.clear();
    attributesByUserId.clear();
    unlockedSkillsByUserId.clear();
    streaksByUserId.clear();
    streakActivitiesByUserId.clear();

    // Seed baseline character
    const testChar: Character = {
      id: 'char-' + testUserId,
      userId: testUserId,
      name: 'Vanguard Hero',
      avatar: 'warrior',
      lifeFocus: 'health',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 0,
      evolutionTier: 1,
      evolutionTitle: 'Vanguard Recruit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    charactersByUserId.set(testUserId, testChar);
  });

  it('GET /character/attributes returns all 6 attributes with progression info', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/character/attributes',
      headers: testHeaders,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.attributes).toHaveLength(6);
    expect(body.progress).toBeDefined();

    const strAttr = body.attributes.find(
      (a: { attributeKey: string; xp: number; level: number }) => a.attributeKey === 'STRENGTH'
    );
    expect(strAttr).toBeDefined();
    // Health life focus gives +25 initial starting XP
    expect(strAttr.xp).toBe(25);
    expect(strAttr.level).toBe(1);
  });

  it('GET /character/evolution returns evolution profile', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/character/evolution',
      headers: testHeaders,
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.evolution).toBeDefined();
    expect(body.evolution.tier).toBe(1);
    expect(body.evolution.title).toBe('Vanguard Recruit');
    expect(body.evolution.tierName).toBe('Initiate');
    expect(body.evolution.nextTier.tier).toBe(2);
  });

  it('POST /quest-completion awards attribute XP and skill points on level up', async () => {
    // Create a Hard Health quest (+100 XP)
    const questId = 'quest-health-1';
    const testQuest: Quest = {
      id: questId,
      userId: testUserId,
      characterId: 'char-' + testUserId,
      title: 'Morning 10k Run',
      category: 'Health',
      difficulty: 'Hard',
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    questsById.set(questId, testQuest);

    const res = await app.inject({
      method: 'POST',
      url: '/quest-completion',
      headers: testHeaders,
      payload: { questId },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();

    // Overall character leveled up (0 -> 100 XP, level 1 -> 2)
    expect(body.character.xp).toBe(100);
    expect(body.character.level).toBe(2);
    expect(body.leveledUp).toBe(true);

    // Attribute gained XP (25 initial + 100 = 125 XP, level 1 -> 2)
    expect(body.attributeGain).toBeDefined();
    expect(body.attributeGain.attributeKey).toBe('STRENGTH');
    expect(body.attributeGain.xpGained).toBe(100);
    expect(body.attributeGain.newLevel).toBe(2);
    expect(body.attributeGain.leveledUp).toBe(true);

    // Skill points: +1 from char level up, +1 from attribute level up = 2 SP
    expect(body.skillPointsEarned).toBe(2);
    expect(body.unspentSkillPoints).toBe(2);
  });

  it('GET /skill-tree and POST /skill-tree/unlock validates prerequisites and unlocks node', async () => {
    // Set user character to have 2 SP and attribute STRENGTH at level 2
    const char = charactersByUserId.get(testUserId)!;
    char.skillPoints = 2;
    charactersByUserId.set(testUserId, char);

    // Give strength level 2 (60 XP)
    const attrRes = await app.inject({
      method: 'GET',
      url: '/character/attributes',
      headers: testHeaders,
    });
    expect(attrRes.statusCode).toBe(200);

    // Check skill tree
    const treeRes = await app.inject({
      method: 'GET',
      url: '/skill-tree',
      headers: testHeaders,
    });
    expect(treeRes.statusCode).toBe(200);
    const treeBody = treeRes.json();
    expect(treeBody.availableSkillPoints).toBe(2);

    // Attempt to unlock Tier 2 without Tier 1 prerequisite -> 400
    const failPrereq = await app.inject({
      method: 'POST',
      url: '/skill-tree/unlock',
      headers: testHeaders,
      payload: { skillId: 'str_t2_iron_will' },
    });
    expect(failPrereq.statusCode).toBe(400);

    // Unlock Tier 1 node -> 200
    const unlockRes = await app.inject({
      method: 'POST',
      url: '/skill-tree/unlock',
      headers: testHeaders,
      payload: { skillId: 'str_t1_endurance' },
    });
    expect(unlockRes.statusCode).toBe(200);
    const unlockBody = unlockRes.json();
    expect(unlockBody.success).toBe(true);
    expect(unlockBody.availableSkillPoints).toBe(1);
    expect(unlockBody.unlockedSkillIds).toContain('str_t1_endurance');

    // Attempt to unlock already unlocked node -> 409
    const dupRes = await app.inject({
      method: 'POST',
      url: '/skill-tree/unlock',
      headers: testHeaders,
      payload: { skillId: 'str_t1_endurance' },
    });
    expect(dupRes.statusCode).toBe(409);
  });
});
