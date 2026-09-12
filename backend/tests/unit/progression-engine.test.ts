import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_XP_MAP,
  getLevelFromXp,
  getXpThresholdForLevel,
  getXpProgress,
} from '@shared/constants/progression';

describe('Progression Engine - Unit Tests', () => {
  describe('Difficulty XP Mapping', () => {
    it('awards exactly 25 XP for EASY difficulty', () => {
      expect(DIFFICULTY_XP_MAP.EASY).toBe(25);
    });

    it('awards exactly 50 XP for MEDIUM difficulty', () => {
      expect(DIFFICULTY_XP_MAP.MEDIUM).toBe(50);
    });

    it('awards exactly 100 XP for HARD difficulty', () => {
      expect(DIFFICULTY_XP_MAP.HARD).toBe(100);
    });
  });

  describe('Deterministic Level Calculation', () => {
    it('calculates Level 1 for 0 to 99 XP', () => {
      expect(getLevelFromXp(0)).toBe(1);
      expect(getLevelFromXp(50)).toBe(1);
      expect(getLevelFromXp(99)).toBe(1);
    });

    it('calculates Level 2 for 100 to 249 XP', () => {
      expect(getLevelFromXp(100)).toBe(2);
      expect(getLevelFromXp(175)).toBe(2);
      expect(getLevelFromXp(249)).toBe(2);
    });

    it('calculates Level 3 for 250 to 449 XP', () => {
      expect(getLevelFromXp(250)).toBe(3);
      expect(getLevelFromXp(350)).toBe(3);
      expect(getLevelFromXp(449)).toBe(3);
    });

    it('calculates Level 4 for 450 to 699 XP', () => {
      expect(getLevelFromXp(450)).toBe(4);
      expect(getLevelFromXp(550)).toBe(4);
      expect(getLevelFromXp(699)).toBe(4);
    });

    it('calculates Level 5 for 700 to 999 XP', () => {
      expect(getLevelFromXp(700)).toBe(5);
      expect(getLevelFromXp(850)).toBe(5);
      expect(getLevelFromXp(999)).toBe(5);
    });

    it('calculates Level 6+ with 350 XP increments', () => {
      expect(getLevelFromXp(1000)).toBe(6);
      expect(getLevelFromXp(1349)).toBe(6);
      expect(getLevelFromXp(1350)).toBe(7);
      expect(getLevelFromXp(1700)).toBe(8);
    });
  });

  describe('Level Threshold and Progress Calculation', () => {
    it('returns exact threshold floor for levels', () => {
      expect(getXpThresholdForLevel(1)).toBe(0);
      expect(getXpThresholdForLevel(2)).toBe(100);
      expect(getXpThresholdForLevel(3)).toBe(250);
      expect(getXpThresholdForLevel(4)).toBe(450);
      expect(getXpThresholdForLevel(5)).toBe(700);
      expect(getXpThresholdForLevel(6)).toBe(1000);
      expect(getXpThresholdForLevel(7)).toBe(1350);
    });

    it('computes correct progress percentage within level range', () => {
      // Level 1: 0 to 100 XP range. At 50 XP -> 50%
      const progress50 = getXpProgress(50);
      expect(progress50.currentLevel).toBe(1);
      expect(progress50.nextLevel).toBe(2);
      expect(progress50.currentLevelXpFloor).toBe(0);
      expect(progress50.nextLevelXpThreshold).toBe(100);
      expect(progress50.xpInCurrentLevel).toBe(50);
      expect(progress50.xpRequiredForLevel).toBe(100);
      expect(progress50.progressPercentage).toBe(50);

      // Level 2: 100 to 250 XP range (150 XP span). At 175 XP -> 75 XP in level -> 50%
      const progress175 = getXpProgress(175);
      expect(progress175.currentLevel).toBe(2);
      expect(progress175.xpInCurrentLevel).toBe(75);
      expect(progress175.xpRequiredForLevel).toBe(150);
      expect(progress175.progressPercentage).toBe(50);
    });
  });
});
