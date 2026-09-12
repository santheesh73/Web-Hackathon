export type EvolutionTier = 1 | 2 | 3 | 4;

export interface NextTierRequirements {
  tier: EvolutionTier;
  minLevel: number;
  minSkills: number;
  minAttributeLevel: number;
  levelMet: boolean;
  skillsMet: boolean;
  attributesMet: boolean;
  allMet: boolean;
  progressPercent: number;
}

export interface EvolutionProfile {
  tier: EvolutionTier;
  title: string;
  archetype: string;
  avatar: string;
  frameClass: string;
  auraClass: string;
  tierName: string;
  unlockedPerks: string[];
  nextTier: NextTierRequirements | null;
}

export interface EvolutionCalculationResult {
  tier: EvolutionTier;
  title: string;
  tierName: string;
  evolved: boolean;
  previousTier: EvolutionTier;
}
