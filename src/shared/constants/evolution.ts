import type {
  EvolutionCalculationResult,
  EvolutionProfile,
  EvolutionTier,
  NextTierRequirements,
} from '../types/evolution';

export const TIER_NAMES: Record<EvolutionTier, string> = {
  1: 'Initiate',
  2: 'Adept',
  3: 'Master',
  4: 'Paragon',
};

export const ARCHETYPE_EVOLUTION_TITLES: Record<string, Record<EvolutionTier, string>> = {
  warrior: {
    1: 'Vanguard Recruit',
    2: 'Blade Vanguard',
    3: 'Warlord Champion',
    4: 'Immortal Sovereign',
  },
  scholar: {
    1: 'Arcanist Apprentice',
    2: 'Arcane Scholar',
    3: 'High Arcanist',
    4: 'Omniscient Luminary',
  },
  scout: {
    1: 'Pathfinder Scout',
    2: 'Shadow Ranger',
    3: 'Phantom Warden',
    4: 'Apex Horizon',
  },
  builder: {
    1: 'Novice Artificer',
    2: 'Master Artificer',
    3: 'Architect of Titans',
    4: 'Cosmic Worldsmith',
  },
  alchemist: {
    1: 'Initiate Chemist',
    2: 'Grand Alchemist',
    3: 'Philosopher Sage',
    4: 'Transmuted Sovereign',
  },
  sentinel: {
    1: 'Acolyte Guardian',
    2: 'Bastion Guardian',
    3: 'Aegis Commander',
    4: 'Eternal Aegis',
  },
};

export const EVOLUTION_TIER_REQUIREMENTS: Record<
  EvolutionTier,
  { minLevel: number; minSkills: number; minAttributeLevel: number }
> = {
  1: { minLevel: 1, minSkills: 0, minAttributeLevel: 1 },
  2: { minLevel: 5, minSkills: 3, minAttributeLevel: 3 },
  3: { minLevel: 10, minSkills: 6, minAttributeLevel: 5 },
  4: { minLevel: 20, minSkills: 10, minAttributeLevel: 7 },
};

export const TIER_AURA_CLASSES: Record<EvolutionTier, string> = {
  1: 'ring-1 ring-border shadow-sm',
  2: 'ring-2 ring-indigo-400/60 shadow-md shadow-indigo-100 dark:shadow-indigo-950/40',
  3: 'ring-2 ring-amber-400/80 shadow-lg shadow-amber-200/50 dark:shadow-amber-950/60 animate-pulse',
  4: 'ring-4 ring-purple-500/90 shadow-2xl shadow-purple-400/60 dark:shadow-purple-900/80',
};

export const TIER_FRAME_CLASSES: Record<EvolutionTier, string> = {
  1: 'border-border bg-card',
  2: 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20',
  3: 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/30',
  4: 'border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 via-amber-50/30 to-indigo-50/50',
};

export function getEvolutionTitle(avatar: string, tier: EvolutionTier): string {
  const archetypeMap = ARCHETYPE_EVOLUTION_TITLES[avatar.toLowerCase()] || ARCHETYPE_EVOLUTION_TITLES.warrior;
  return archetypeMap[tier] || archetypeMap[1];
}

export function calculateEvolutionTier(
  level: number,
  skillsCount: number,
  maxAttributeLevel: number
): EvolutionTier {
  if (
    level >= EVOLUTION_TIER_REQUIREMENTS[4].minLevel &&
    skillsCount >= EVOLUTION_TIER_REQUIREMENTS[4].minSkills &&
    maxAttributeLevel >= EVOLUTION_TIER_REQUIREMENTS[4].minAttributeLevel
  ) {
    return 4;
  }
  if (
    level >= EVOLUTION_TIER_REQUIREMENTS[3].minLevel &&
    skillsCount >= EVOLUTION_TIER_REQUIREMENTS[3].minSkills &&
    maxAttributeLevel >= EVOLUTION_TIER_REQUIREMENTS[3].minAttributeLevel
  ) {
    return 3;
  }
  if (
    level >= EVOLUTION_TIER_REQUIREMENTS[2].minLevel &&
    skillsCount >= EVOLUTION_TIER_REQUIREMENTS[2].minSkills &&
    maxAttributeLevel >= EVOLUTION_TIER_REQUIREMENTS[2].minAttributeLevel
  ) {
    return 2;
  }
  return 1;
}

export function getNextTierRequirements(
  currentTier: EvolutionTier,
  level: number,
  skillsCount: number,
  maxAttributeLevel: number
): NextTierRequirements | null {
  if (currentTier >= 4) return null;

  const nextTier = (currentTier + 1) as EvolutionTier;
  const req = EVOLUTION_TIER_REQUIREMENTS[nextTier];

  const levelMet = level >= req.minLevel;
  const skillsMet = skillsCount >= req.minSkills;
  const attributesMet = maxAttributeLevel >= req.minAttributeLevel;
  const allMet = levelMet && skillsMet && attributesMet;

  // Calculate composite progress towards next tier
  const levelProgress = Math.min(1, level / req.minLevel);
  const skillsProgress = req.minSkills > 0 ? Math.min(1, skillsCount / req.minSkills) : 1;
  const attrProgress = Math.min(1, maxAttributeLevel / req.minAttributeLevel);

  const progressPercent = Math.min(
    100,
    Math.round(((levelProgress + skillsProgress + attrProgress) / 3) * 100)
  );

  return {
    tier: nextTier,
    minLevel: req.minLevel,
    minSkills: req.minSkills,
    minAttributeLevel: req.minAttributeLevel,
    levelMet,
    skillsMet,
    attributesMet,
    allMet,
    progressPercent,
  };
}

export function buildEvolutionProfile(
  avatar: string,
  level: number,
  skillsCount: number,
  maxAttributeLevel: number,
  unlockedPerks: string[] = []
): EvolutionProfile {
  const tier = calculateEvolutionTier(level, skillsCount, maxAttributeLevel);
  const title = getEvolutionTitle(avatar, tier);
  const tierName = TIER_NAMES[tier];
  const nextTier = getNextTierRequirements(tier, level, skillsCount, maxAttributeLevel);

  return {
    tier,
    title,
    archetype: avatar,
    avatar,
    frameClass: TIER_FRAME_CLASSES[tier],
    auraClass: TIER_AURA_CLASSES[tier],
    tierName,
    unlockedPerks,
    nextTier,
  };
}
