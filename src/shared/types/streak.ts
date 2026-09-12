export type StreakStatus = 'ACTIVE' | 'AT_RISK' | 'BROKEN' | 'NONE';

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string; // YYYY-MM-DD (UTC)
  recoveryAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StreakActivity {
  id: string;
  userId: string;
  activityDate: string; // YYYY-MM-DD (UTC)
  questsCompleted: number;
  isRecovery: boolean;
  createdAt: string;
}

export interface StreakCalendarDay {
  date: string; // YYYY-MM-DD
  count: number;
  active: boolean;
  isToday: boolean;
  isRecovery: boolean;
}

export interface StreakRecoveryResult {
  success: boolean;
  message: string;
  recoveredDate?: string;
  newStreak?: number;
  recoveryAvailable?: boolean;
}

export interface StreakSummary {
  streak: Streak;
  status: StreakStatus;
  isAtRisk: boolean;
  daysActiveLast30Days: number;
}
