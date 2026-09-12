import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_LABELS,
  REQUIREMENT_TYPES,
  REQUIREMENT_TYPE_LABELS,
  SEED_ACHIEVEMENTS,
} from '@shared/constants/achievements';
import {
  AchievementCategorySchema,
  RequirementTypeSchema,
  AchievementFilterSchema,
} from '@shared/schemas/achievement';

describe('Achievement Engine Unit Tests', () => {
  it('contains 14 valid seed achievements across diverse categories', () => {
    expect(SEED_ACHIEVEMENTS.length).toBe(14);

    const ids = new Set<string>();
    const keys = new Set<string>();

    for (const ach of SEED_ACHIEVEMENTS) {
      expect(ach.id).toBeDefined();
      expect(ach.key).toBeDefined();
      expect(ach.name.length).toBeGreaterThan(0);
      expect(ach.description.length).toBeGreaterThan(0);
      expect(ach.target).toBeGreaterThan(0);
      expect(ach.isActive).toBe(true);

      // Verify no duplicates
      expect(ids.has(ach.id)).toBe(false);
      expect(keys.has(ach.key)).toBe(false);
      ids.add(ach.id);
      keys.add(ach.key);

      // Verify valid category and requirement type
      expect(ACHIEVEMENT_CATEGORIES).toContain(ach.category);
      expect(REQUIREMENT_TYPES).toContain(ach.requirementType);
    }
  });

  it('verifies all categories and requirements have human-readable labels', () => {
    for (const cat of ACHIEVEMENT_CATEGORIES) {
      expect(ACHIEVEMENT_CATEGORY_LABELS[cat]).toBeDefined();
      expect(ACHIEVEMENT_CATEGORY_LABELS[cat].length).toBeGreaterThan(0);
    }

    for (const req of REQUIREMENT_TYPES) {
      expect(REQUIREMENT_TYPE_LABELS[req]).toBeDefined();
      expect(REQUIREMENT_TYPE_LABELS[req].length).toBeGreaterThan(0);
    }
  });

  it('validates AchievementCategorySchema with valid and invalid values', () => {
    expect(AchievementCategorySchema.safeParse('QUESTS').success).toBe(true);
    expect(AchievementCategorySchema.safeParse('STREAKS').success).toBe(true);
    expect(AchievementCategorySchema.safeParse('BOSS_QUESTS').success).toBe(true);
    expect(AchievementCategorySchema.safeParse('INVALID_CAT').success).toBe(false);
  });

  it('validates RequirementTypeSchema with valid and invalid values', () => {
    expect(RequirementTypeSchema.safeParse('QUEST_COUNT').success).toBe(true);
    expect(RequirementTypeSchema.safeParse('PLAYER_LEVEL').success).toBe(true);
    expect(RequirementTypeSchema.safeParse('EQUIPPED_ITEM_COUNT').success).toBe(true);
    expect(RequirementTypeSchema.safeParse('RANDOM_REQ').success).toBe(false);
  });

  it('validates AchievementFilterSchema query options', () => {
    const validQuery = {
      status: 'UNLOCKED',
      category: 'QUESTS',
      search: 'first',
      sortBy: 'RECENT',
    };
    expect(AchievementFilterSchema.safeParse(validQuery).success).toBe(true);

    const emptyQuery = {};
    expect(AchievementFilterSchema.safeParse(emptyQuery).success).toBe(true);

    const invalidQuery = {
      status: 'UNKNOWN_STATUS',
    };
    expect(AchievementFilterSchema.safeParse(invalidQuery).success).toBe(false);
  });
});
