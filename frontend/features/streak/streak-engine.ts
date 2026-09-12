import type { Streak, StreakStatus } from '@/../src/shared/types/streak';

export function getUtcTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getUtcYesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getUtcDayBeforeYesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 2);
  return d.toISOString().split('T')[0];
}

export function calculateStreakStatus(streak: Streak): {
  status: StreakStatus;
  isAtRisk: boolean;
} {
  const today = getUtcTodayString();
  const yesterday = getUtcYesterdayString();
  const dayBefore = getUtcDayBeforeYesterdayString();

  if (streak.currentStreak === 0 || !streak.lastActivityDate) {
    return { status: 'NONE', isAtRisk: false };
  }

  if (streak.lastActivityDate === today || streak.lastActivityDate === yesterday) {
    return { status: 'ACTIVE', isAtRisk: false };
  }

  if (streak.lastActivityDate === dayBefore) {
    return {
      status: streak.recoveryAvailable ? 'AT_RISK' : 'BROKEN',
      isAtRisk: streak.recoveryAvailable,
    };
  }

  return { status: 'BROKEN', isAtRisk: false };
}
