import type { Character } from './character';

export type QuestCategory =
  | 'Health'
  | 'Learning'
  | 'Career'
  | 'Finance'
  | 'Personal'
  | 'Creativity';

export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestStatus = 'ACTIVE' | 'COMPLETED';

export interface Quest {
  id: string;
  userId: string;
  characterId: string;
  title: string;
  description?: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  status: QuestStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface QuestCompletionResult {
  quest: Quest;
  xpAwarded: number;
  character: Character;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
}
