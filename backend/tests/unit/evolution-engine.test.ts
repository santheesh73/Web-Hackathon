import { describe, it, expect } from 'vitest';
import {
  calculateEvolutionTier,
  getEvolutionTitle,
  getNextTierRequirements,
  buildEvolutionProfile,
  ARCHETYPE_EVOLUTION_TITLES,
} from '../../../src/shared/constants/evolution';

describe('Evolution Engine (Unit)', () => {
  it('calculates evolution tiers accurately based on level, skills, and attribute thresholds', () => {
    // Baseline -> Tier 1
    expect(calculateEvolutionTier(1, 0, 1)).toBe(1);
    expect(calculateEvolutionTier(4, 2, 2)).toBe(1);

    // Tier 2 thresholds: Level 5+, 3+ skills, max attr level 3+
    expect(calculateEvolutionTier(5, 3, 3)).toBe(2);
    expect(calculateEvolutionTier(9, 5, 4)).toBe(2);

    // Tier 3 thresholds: Level 10+, 6+ skills, max attr level 5+
    expect(calculateEvolutionTier(10, 6, 5)).toBe(3);
    expect(calculateEvolutionTier(19, 9, 6)).toBe(3);

    // Tier 4 thresholds: Level 20+, 10+ skills, max attr level 7+
    expect(calculateEvolutionTier(20, 10, 7)).toBe(4);
    expect(calculateEvolutionTier(50, 18, 10)).toBe(4);
  });

  it('provides specialized evolution titles for all 6 character archetypes', () => {
    const archetypes = Object.keys(ARCHETYPE_EVOLUTION_TITLES);
    expect(archetypes).toHaveLength(6);
    expect(archetypes).toContain('warrior');
    expect(archetypes).toContain('scholar');
    expect(archetypes).toContain('scout');
    expect(archetypes).toContain('builder');
    expect(archetypes).toContain('alchemist');
    expect(archetypes).toContain('sentinel');

    // Check warrior progression
    expect(getEvolutionTitle('warrior', 1)).toBe('Vanguard Recruit');
    expect(getEvolutionTitle('warrior', 2)).toBe('Blade Vanguard');
    expect(getEvolutionTitle('warrior', 3)).toBe('Warlord Champion');
    expect(getEvolutionTitle('warrior', 4)).toBe('Immortal Sovereign');

    // Check scholar progression
    expect(getEvolutionTitle('scholar', 1)).toBe('Arcanist Apprentice');
    expect(getEvolutionTitle('scholar', 4)).toBe('Omniscient Luminary');
  });

  it('computes next tier requirements and progress percent correctly', () => {
    const nextReq = getNextTierRequirements(1, 3, 1, 2);
    expect(nextReq).not.toBeNull();
    expect(nextReq?.tier).toBe(2);
    expect(nextReq?.minLevel).toBe(5);
    expect(nextReq?.minSkills).toBe(3);
    expect(nextReq?.minAttributeLevel).toBe(3);
    expect(nextReq?.levelMet).toBe(false);
    expect(nextReq?.skillsMet).toBe(false);
    expect(nextReq?.attributesMet).toBe(false);
    expect(nextReq?.allMet).toBe(false);

    // At tier 4, next tier should be null
    const maxReq = getNextTierRequirements(4, 25, 12, 8);
    expect(maxReq).toBeNull();
  });

  it('builds full evolution profile with appropriate aura and frame classes', () => {
    const profile = buildEvolutionProfile('warrior', 1, 0, 1);
    expect(profile.tier).toBe(1);
    expect(profile.title).toBe('Vanguard Recruit');
    expect(profile.tierName).toBe('Initiate');
    expect(profile.nextTier).not.toBeNull();
    expect(profile.nextTier?.tier).toBe(2);
  });
});
