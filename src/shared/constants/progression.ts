import type { QuestCategory, QuestDifficulty } from '../types/quest';

export const DIFFICULTY_XP_MAP: Record<string, number> = {
  Easy: 25,
  Medium: 50,
  Hard: 100,
  EASY: 25,
  MEDIUM: 50,
  HARD: 100,
};

export const QUEST_CATEGORIES: QuestCategory[] = [
  'Health',
  'Learning',
  'Career',
  'Finance',
  'Personal',
  'Creativity',
];

export function getXpForDifficulty(difficulty: QuestDifficulty | string): number {
  return DIFFICULTY_XP_MAP[difficulty] || 25;
}

export function getLevelFromXp(xp: number): number {
  if (xp < 0) return 1;
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 450) return 3;
  if (xp < 700) return 4;
  if (xp < 1000) return 5;
  return 6 + Math.floor((xp - 1000) / 350);
}

export function getXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 250;
  if (level === 4) return 450;
  if (level === 5) return 700;
  return 1000 + (level - 6) * 350;
}

export interface XpProgressInfo {
  currentLevel: number;
  nextLevel: number;
  currentLevelBaseXp: number;
  currentLevelXpFloor: number;
  nextLevelXp: number;
  nextLevelXpThreshold: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  xpRequiredForLevel: number;
  progressPercent: number;
  progressPercentage: number;
}

export function getXpProgress(xp: number): XpProgressInfo {
  const currentLevel = getLevelFromXp(xp);
  const nextLevel = currentLevel + 1;
  const currentLevelBaseXp = getXpThresholdForLevel(currentLevel);
  const nextLevelXp = getXpThresholdForLevel(nextLevel);

  const xpInCurrentLevel = Math.max(0, xp - currentLevelBaseXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
  );

  return {
    currentLevel,
    nextLevel,
    currentLevelBaseXp,
    currentLevelXpFloor: currentLevelBaseXp,
    nextLevelXp,
    nextLevelXpThreshold: nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpRequiredForLevel: xpNeededForNextLevel,
    progressPercent,
    progressPercentage: progressPercent,
  };
}
