import type { QuestCategory } from './quest';

export type AttributeKey =
  | 'STRENGTH'
  | 'INTELLIGENCE'
  | 'DISCIPLINE'
  | 'WISDOM'
  | 'CREATIVITY'
  | 'RESILIENCE';

export interface CharacterAttribute {
  id: string;
  characterId: string;
  userId: string;
  attributeKey: AttributeKey;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeProgressInfo {
  attributeKey: AttributeKey;
  level: number;
  xp: number;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
}

export interface AttributeDefinition {
  key: AttributeKey;
  label: string;
  code: string;
  category: QuestCategory;
  description: string;
  iconName: string;
  color: string;
  accentColor: string;
}

export interface AttributeGainResult {
  attributeKey: AttributeKey;
  xpGained: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  skillPointsEarned: number;
}
