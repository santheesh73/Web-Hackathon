import { describe, it, expect } from 'vitest';
import {
  CATEGORY_TO_ATTRIBUTE_MAP,
  getAttributeLevelFromXp,
  getAttributeThresholdForLevel,
  getAttributeProgress,
  ATTRIBUTE_DEFINITIONS,
} from '../../../src/shared/constants/attributes';

describe('Attribute Engine (Unit)', () => {
  it('correctly maps all 6 quest categories to corresponding attributes', () => {
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Health).toBe('STRENGTH');
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Learning).toBe('INTELLIGENCE');
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Career).toBe('DISCIPLINE');
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Finance).toBe('WISDOM');
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Creativity).toBe('CREATIVITY');
    expect(CATEGORY_TO_ATTRIBUTE_MAP.Personal).toBe('RESILIENCE');
  });

  it('calculates deterministic attribute levels according to XP curve', () => {
    expect(getAttributeLevelFromXp(0)).toBe(1);
    expect(getAttributeLevelFromXp(49)).toBe(1);
    expect(getAttributeLevelFromXp(50)).toBe(2);
    expect(getAttributeLevelFromXp(149)).toBe(2);
    expect(getAttributeLevelFromXp(150)).toBe(3);
    expect(getAttributeLevelFromXp(299)).toBe(3);
    expect(getAttributeLevelFromXp(300)).toBe(4);
    expect(getAttributeLevelFromXp(499)).toBe(4);
    expect(getAttributeLevelFromXp(500)).toBe(5);
    expect(getAttributeLevelFromXp(749)).toBe(5);
    expect(getAttributeLevelFromXp(750)).toBe(6);
    expect(getAttributeLevelFromXp(1000)).toBe(7);
  });

  it('calculates exact XP thresholds for each attribute tier', () => {
    expect(getAttributeThresholdForLevel(1)).toBe(0);
    expect(getAttributeThresholdForLevel(2)).toBe(50);
    expect(getAttributeThresholdForLevel(3)).toBe(150);
    expect(getAttributeThresholdForLevel(4)).toBe(300);
    expect(getAttributeThresholdForLevel(5)).toBe(500);
    expect(getAttributeThresholdForLevel(6)).toBe(750);
    expect(getAttributeThresholdForLevel(7)).toBe(1000);
  });

  it('calculates attribute progress percentage accurately', () => {
    // Level 1: 0 to 50 XP. At 25 XP, progress should be 50%
    const progress25 = getAttributeProgress('STRENGTH', 25);
    expect(progress25.level).toBe(1);
    expect(progress25.xpInCurrentLevel).toBe(25);
    expect(progress25.xpNeededForNextLevel).toBe(50);
    expect(progress25.progressPercent).toBe(50);

    // Level 2: 50 to 150 XP. At 100 XP, progress should be 50%
    const progress100 = getAttributeProgress('INTELLIGENCE', 100);
    expect(progress100.level).toBe(2);
    expect(progress100.xpInCurrentLevel).toBe(50);
    expect(progress100.xpNeededForNextLevel).toBe(100);
    expect(progress100.progressPercent).toBe(50);
  });

  it('provides complete attribute definitions for all 6 attributes', () => {
    const keys = Object.keys(ATTRIBUTE_DEFINITIONS);
    expect(keys).toHaveLength(6);
    expect(keys).toContain('STRENGTH');
    expect(keys).toContain('INTELLIGENCE');
    expect(keys).toContain('DISCIPLINE');
    expect(keys).toContain('WISDOM');
    expect(keys).toContain('CREATIVITY');
    expect(keys).toContain('RESILIENCE');
  });
});
