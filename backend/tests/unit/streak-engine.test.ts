import { describe, it, expect } from 'vitest';
import {
  calculateStreakStatus,
  getUtcTodayString,
  getUtcYesterdayString,
  getUtcDayBeforeYesterdayString,
} from '../../src/modules/streak/routes';
import type { Streak } from '@shared/types/streak';

describe('Streak Engine - Unit Tests', () => {
  it('returns NONE status when currentStreak is 0 or no activity', () => {
    const streak: Streak = {
      id: 'streak-1',
      userId: 'user-1',
      currentStreak: 0,
      longestStreak: 0,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('NONE');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns ACTIVE status when last activity was today', () => {
    const today = getUtcTodayString();
    const streak: Streak = {
      id: 'streak-2',
      userId: 'user-2',
      currentStreak: 3,
      longestStreak: 5,
      lastActivityDate: today,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('ACTIVE');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns ACTIVE status when last activity was yesterday', () => {
    const yesterday = getUtcYesterdayString();
    const streak: Streak = {
      id: 'streak-3',
      userId: 'user-3',
      currentStreak: 5,
      longestStreak: 10,
      lastActivityDate: yesterday,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('ACTIVE');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns AT_RISK status when yesterday was missed and recovery shield is available', () => {
    const dayBeforeYesterday = getUtcDayBeforeYesterdayString();
    const streak: Streak = {
      id: 'streak-4',
      userId: 'user-4',
      currentStreak: 7,
      longestStreak: 7,
      lastActivityDate: dayBeforeYesterday,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('AT_RISK');
    expect(result.isAtRisk).toBe(true);
  });

  it('returns BROKEN status when yesterday was missed and recovery shield was already used', () => {
    const dayBeforeYesterday = getUtcDayBeforeYesterdayString();
    const streak: Streak = {
      id: 'streak-5',
      userId: 'user-5',
      currentStreak: 7,
      longestStreak: 7,
      lastActivityDate: dayBeforeYesterday,
      recoveryAvailable: false, // Already used!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('BROKEN');
    expect(result.isAtRisk).toBe(false);
  });

  it('returns BROKEN status when activity is older than 2 days', () => {
    const oldDate = '2026-01-01';
    const streak: Streak = {
      id: 'streak-6',
      userId: 'user-6',
      currentStreak: 12,
      longestStreak: 12,
      lastActivityDate: oldDate,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = calculateStreakStatus(streak);
    expect(result.status).toBe('BROKEN');
    expect(result.isAtRisk).toBe(false);
  });
});
