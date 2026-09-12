import type { Quest } from './quest';

export type BossDifficulty = 'Rare' | 'Epic' | 'Legendary';

export type BossStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface BossObjective {
  id: string;
  bossId: string;
  userId: string;
  title: string;
  description?: string;
  displayOrder: number;
  requiredProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface BossObjectiveQuest {
  id: string;
  objectiveId: string;
  questId: string;
  userId: string;
  createdAt: string;
}

export interface BossObjectiveWithQuests extends BossObjective {
  linkedQuests: Quest[];
  completedQuestsCount: number;
  progressPercent: number;
  isCompleted: boolean;
}

export interface BossQuest {
  id: string;
  characterId: string;
  userId: string;
  title: string;
  description?: string;
  difficulty: BossDifficulty;
  status: BossStatus;
  deadline?: string;
  rewardXp: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BossQuestWithDetails extends BossQuest {
  objectives: BossObjectiveWithQuests[];
  totalObjectivesCount: number;
  completedObjectivesCount: number;
  progressPercent: number;
  isDefeated: boolean;
}

export interface BossCompletionResult {
  bossId: string;
  bossTitle: string;
  difficulty: BossDifficulty;
  rewardXp: number;
  completedAt: string;
  defeated: boolean;
}
