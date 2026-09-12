import { describe, it, expect } from 'vitest';
import {
  BOSS_DIFFICULTIES,
  BOSS_REWARD_MAP,
  getBossRewardXp,
  calculateObjectiveProgress,
  isObjectiveCompleted,
  calculateBossProgress,
  isBossDefeated,
} from '../../../src/shared/constants/boss-quests';
import {
  CreateBossQuestSchema,
  CreateBossObjectiveSchema,
  LinkQuestSchema,
} from '../../../src/shared/schemas/boss-quest';

describe('Boss Engine Unit Tests', () => {
  describe('Boss Difficulties & Reward XP Map', () => {
    it('defines the three fixed difficulties: Rare, Epic, Legendary', () => {
      expect(BOSS_DIFFICULTIES).toEqual(['Rare', 'Epic', 'Legendary']);
    });

    it('maps fixed XP rewards correctly (Rare: 250, Epic: 500, Legendary: 1000)', () => {
      expect(BOSS_REWARD_MAP.Rare).toBe(250);
      expect(BOSS_REWARD_MAP.Epic).toBe(500);
      expect(BOSS_REWARD_MAP.Legendary).toBe(1000);
      expect(getBossRewardXp('Rare')).toBe(250);
      expect(getBossRewardXp('Epic')).toBe(500);
      expect(getBossRewardXp('Legendary')).toBe(1000);
    });
  });

  describe('Objective Progress & Completion Math', () => {
    it('calculates objective progress accurately and caps at 100%', () => {
      expect(calculateObjectiveProgress(0, 3)).toBe(0);
      expect(calculateObjectiveProgress(1, 3)).toBe(33);
      expect(calculateObjectiveProgress(2, 3)).toBe(67);
      expect(calculateObjectiveProgress(3, 3)).toBe(100);
      expect(calculateObjectiveProgress(4, 3)).toBe(100);
    });

    it('handles edge case of 0 required progress safely', () => {
      expect(calculateObjectiveProgress(0, 0)).toBe(100);
    });

    it('correctly identifies when an objective is completed', () => {
      expect(isObjectiveCompleted(0, 2)).toBe(false);
      expect(isObjectiveCompleted(1, 2)).toBe(false);
      expect(isObjectiveCompleted(2, 2)).toBe(true);
      expect(isObjectiveCompleted(5, 2)).toBe(true);
    });
  });

  describe('Boss Progress & Defeat Detection', () => {
    it('calculates overall boss progress from completed objectives fraction', () => {
      expect(calculateBossProgress([])).toBe(0);
      expect(
        calculateBossProgress([
          { isCompleted: true },
          { isCompleted: false },
          { isCompleted: false },
          { isCompleted: false },
        ])
      ).toBe(25);
      expect(
        calculateBossProgress([
          { isCompleted: true },
          { isCompleted: true },
          { isCompleted: true },
        ])
      ).toBe(100);
    });

    it('detects boss defeat only when all objectives are completed', () => {
      expect(isBossDefeated([])).toBe(false);
      expect(
        isBossDefeated([
          { isCompleted: true },
          { isCompleted: false },
        ])
      ).toBe(false);
      expect(
        isBossDefeated([
          { isCompleted: true },
          { isCompleted: true },
          { isCompleted: true },
        ])
      ).toBe(true);
    });
  });

  describe('Zod Validation Schemas', () => {
    it('validates boss creation payload with at least one objective', () => {
      const valid = CreateBossQuestSchema.safeParse({
        title: 'Launch My Portfolio',
        description: 'Complete all steps to publish live website',
        difficulty: 'Epic',
        objectives: [
          { title: 'Design Layout', requiredProgress: 2 },
          { title: 'Frontend Build', requiredProgress: 3 },
        ],
      });
      expect(valid.success).toBe(true);
    });

    it('rejects boss creation without objectives', () => {
      const invalid = CreateBossQuestSchema.safeParse({
        title: 'Empty Boss',
        difficulty: 'Rare',
        objectives: [],
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects invalid difficulty strings', () => {
      const invalid = CreateBossQuestSchema.safeParse({
        title: 'Invalid Diff',
        difficulty: 'Mythic', // not allowed
        objectives: [{ title: 'Obj 1' }],
      });
      expect(invalid.success).toBe(false);
    });

    it('validates link quest schema', () => {
      expect(LinkQuestSchema.safeParse({ questId: 'q-1', objectiveId: 'obj-1' }).success).toBe(true);
      expect(LinkQuestSchema.safeParse({ questId: '', objectiveId: 'obj-1' }).success).toBe(false);
    });

    it('validates boss objective schema', () => {
      expect(
        CreateBossObjectiveSchema.safeParse({ title: 'New Obj', requiredProgress: 2 }).success
      ).toBe(true);
      expect(CreateBossObjectiveSchema.safeParse({ title: '', requiredProgress: 0 }).success).toBe(
        false
      );
    });
  });
});
