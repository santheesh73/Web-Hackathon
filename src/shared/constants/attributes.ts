import type { QuestCategory } from '../types/quest';
import type {
  AttributeDefinition,
  AttributeKey,
  AttributeProgressInfo,
} from '../types/attribute';

export const CATEGORY_TO_ATTRIBUTE_MAP: Record<QuestCategory, AttributeKey> = {
  Health: 'STRENGTH',
  Learning: 'INTELLIGENCE',
  Career: 'DISCIPLINE',
  Finance: 'WISDOM',
  Creativity: 'CREATIVITY',
  Personal: 'RESILIENCE',
};

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  'STRENGTH',
  'INTELLIGENCE',
  'DISCIPLINE',
  'WISDOM',
  'CREATIVITY',
  'RESILIENCE',
];

export const ATTRIBUTE_DEFINITIONS: Record<AttributeKey, AttributeDefinition> = {
  STRENGTH: {
    key: 'STRENGTH',
    label: 'Strength & Vitality',
    code: 'STR',
    category: 'Health',
    description: 'Physical endurance, biological vitality, and athletic consistency.',
    iconName: 'Shield',
    color: 'from-rose-500 to-red-600',
    accentColor: 'text-rose-500 bg-rose-50 border-rose-200',
  },
  INTELLIGENCE: {
    key: 'INTELLIGENCE',
    label: 'Intelligence & Mind',
    code: 'INT',
    category: 'Learning',
    description: 'Cognitive acuity, continuous learning, and intellectual mastery.',
    iconName: 'Brain',
    color: 'from-indigo-500 to-blue-600',
    accentColor: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  },
  DISCIPLINE: {
    key: 'DISCIPLINE',
    label: 'Discipline & Craft',
    code: 'DIS',
    category: 'Career',
    description: 'Professional execution, sustained focus, and project momentum.',
    iconName: 'Briefcase',
    color: 'from-blue-500 to-cyan-600',
    accentColor: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  WISDOM: {
    key: 'WISDOM',
    label: 'Wisdom & Wealth',
    code: 'WIS',
    category: 'Finance',
    description: 'Prudent resource management, financial restraint, and strategic foresight.',
    iconName: 'Coins',
    color: 'from-amber-500 to-yellow-600',
    accentColor: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  CREATIVITY: {
    key: 'CREATIVITY',
    label: 'Creativity & Art',
    code: 'CRT',
    category: 'Creativity',
    description: 'Lateral ideation, artistic expression, novel problem-solving, and design.',
    iconName: 'Palette',
    color: 'from-purple-500 to-violet-600',
    accentColor: 'text-purple-500 bg-purple-50 border-purple-200',
  },
  RESILIENCE: {
    key: 'RESILIENCE',
    label: 'Resilience & Spirit',
    code: 'RES',
    category: 'Personal',
    description: 'Mindfulness balance, emotional composure, and inner fortitude.',
    iconName: 'Sparkles',
    color: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
};

export function getAttributeLevelFromXp(xp: number): number {
  if (xp < 0) return 1;
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  if (xp < 500) return 4;
  if (xp < 750) return 5;
  return 6 + Math.floor((xp - 750) / 250);
}

export function getAttributeThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 50;
  if (level === 3) return 150;
  if (level === 4) return 300;
  if (level === 5) return 500;
  return 750 + (level - 6) * 250;
}

export function getAttributeProgress(
  attributeKey: AttributeKey,
  xp: number
): AttributeProgressInfo {
  const level = getAttributeLevelFromXp(xp);
  const nextLevel = level + 1;
  const currentLevelBaseXp = getAttributeThresholdForLevel(level);
  const nextLevelXp = getAttributeThresholdForLevel(nextLevel);

  const xpInCurrentLevel = Math.max(0, xp - currentLevelBaseXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelXp - currentLevelBaseXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
  );

  return {
    attributeKey,
    level,
    xp,
    currentLevelBaseXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}
