import type { AttributeKey } from './attribute';

export type SkillTier = 1 | 2 | 3;

export interface SkillNode {
  id: string;
  attributeKey: AttributeKey;
  tier: SkillTier;
  title: string;
  description: string;
  spCost: number;
  requiredAttributeLevel: number;
  prerequisiteSkillId: string | null;
  iconName: string;
  perkEffect: string;
}

export interface CharacterSkill {
  id: string;
  characterId: string;
  userId: string;
  skillId: string;
  unlockedAt: string;
}

export interface SkillNodeWithState extends SkillNode {
  isUnlocked: boolean;
  canUnlock: boolean;
  missingRequirements: string[];
}

export interface SkillTreeBranch {
  attributeKey: AttributeKey;
  label: string;
  skills: SkillNodeWithState[];
}

export interface SkillTreeData {
  availableSkillPoints: number;
  spentSkillPoints: number;
  totalSkillPoints: number;
  unlockedSkillIds: string[];
  branches: SkillTreeBranch[];
}

export interface SkillUnlockResult {
  success: boolean;
  skillId: string;
  unlockedSkillTitle: string;
  availableSkillPoints: number;
  spentSkillPoints: number;
  unlockedSkillIds: string[];
  evolutionTier: number;
  evolutionTitle: string;
  newEvolutionUnlocked: boolean;
}
