import type { BossDifficulty } from '../types/boss-quest';

export const BOSS_DIFFICULTIES = ['Rare', 'Epic', 'Legendary'] as const;

export const BOSS_REWARD_MAP: Record<BossDifficulty, number> = {
  Rare: 250,
  Epic: 500,
  Legendary: 1000,
};

export function getBossRewardXp(difficulty: BossDifficulty): number {
  return BOSS_REWARD_MAP[difficulty] ?? 250;
}

export function calculateObjectiveProgress(completedQuests: number, requiredProgress: number): number {
  if (requiredProgress <= 0) return 100;
  const pct = Math.round((completedQuests / requiredProgress) * 100);
  return Math.min(100, Math.max(0, pct));
}

export function isObjectiveCompleted(completedQuests: number, requiredProgress: number): boolean {
  if (requiredProgress <= 0) return true;
  return completedQuests >= requiredProgress;
}

export function calculateBossProgress(objectives: Array<{ isCompleted: boolean }>): number {
  if (!objectives || objectives.length === 0) return 0;
  const completedCount = objectives.filter((o) => o.isCompleted).length;
  return Math.round((completedCount / objectives.length) * 100);
}

export function isBossDefeated(objectives: Array<{ isCompleted: boolean }>): boolean {
  if (!objectives || objectives.length === 0) return false;
  return objectives.every((o) => o.isCompleted);
}

export const BOSS_DIFFICULTY_CONFIG: Record<
  BossDifficulty,
  {
    label: string;
    xp: number;
    color: string;
    borderColor: string;
    bgColor: string;
    badgeVariant: 'rpg' | 'warning' | 'danger';
  }
> = {
  Rare: {
    label: 'Rare',
    xp: 250,
    color: 'text-blue-500 dark:text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10',
    badgeVariant: 'rpg',
  },
  Epic: {
    label: 'Epic',
    xp: 500,
    color: 'text-purple-500 dark:text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    badgeVariant: 'warning',
  },
  Legendary: {
    label: 'Legendary',
    xp: 1000,
    color: 'text-amber-500 dark:text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    badgeVariant: 'danger',
  },
};
