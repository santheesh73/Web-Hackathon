export type AchievementCategory =
  | 'QUESTS'
  | 'STREAKS'
  | 'QUEST_CHAINS'
  | 'BOSS_QUESTS'
  | 'PROGRESSION'
  | 'SKILLS'
  | 'ECONOMY'
  | 'INVENTORY';

export type RequirementType =
  | 'QUEST_COUNT'
  | 'STREAK_DAYS'
  | 'QUEST_CHAIN_COUNT'
  | 'BOSS_COMPLETION_COUNT'
  | 'PLAYER_LEVEL'
  | 'SKILL_COUNT'
  | 'GOLD_EARNED'
  | 'ITEM_COUNT'
  | 'EQUIPPED_ITEM_COUNT';

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  requirementType: RequirementType;
  target: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  characterId: string;
  userId: string;
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  achievement?: Achievement;
}

export interface AchievementWithProgress extends Achievement {
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progressPercent: number;
}

export interface AchievementsSummary {
  total: number;
  unlockedCount: number;
  inProgressCount: number;
  lockedCount: number;
  completionPercent: number;
}

export interface AchievementUnlockResult {
  unlocked: Achievement[];
}
