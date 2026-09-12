import { describe, it, expect } from 'vitest';
import {
  SKILL_NODES,
  getSkillById,
  getSkillsByAttribute,
} from '../../../src/shared/constants/skills';
import { ATTRIBUTE_KEYS } from '../../../src/shared/constants/attributes';
import { UnlockSkillSchema } from '../../../src/shared/schemas/skill';

describe('Skill Tree Engine (Unit)', () => {
  it('contains exactly 18 skill nodes across all 6 attribute branches', () => {
    expect(SKILL_NODES).toHaveLength(18);
    for (const key of ATTRIBUTE_KEYS) {
      const branchSkills = getSkillsByAttribute(key);
      expect(branchSkills).toHaveLength(3);
    }
  });

  it('structures prerequisites and requirements correctly across tiers', () => {
    for (const key of ATTRIBUTE_KEYS) {
      const branch = getSkillsByAttribute(key);
      const t1 = branch.find((s) => s.tier === 1);
      const t2 = branch.find((s) => s.tier === 2);
      const t3 = branch.find((s) => s.tier === 3);

      expect(t1).toBeDefined();
      expect(t2).toBeDefined();
      expect(t3).toBeDefined();

      // Tier 1 rules
      expect(t1!.prerequisiteSkillId).toBeNull();
      expect(t1!.requiredAttributeLevel).toBe(1);
      expect(t1!.spCost).toBe(1);

      // Tier 2 rules
      expect(t2!.prerequisiteSkillId).toBe(t1!.id);
      expect(t2!.requiredAttributeLevel).toBe(2);
      expect(t2!.spCost).toBe(1);

      // Tier 3 rules
      expect(t3!.prerequisiteSkillId).toBe(t2!.id);
      expect(t3!.requiredAttributeLevel).toBe(4);
      expect(t3!.spCost).toBe(2);
    }
  });

  it('correctly retrieves skill by ID', () => {
    const skill = getSkillById('str_t1_endurance');
    expect(skill).toBeDefined();
    expect(skill?.title).toBe('Endurance Engine');
    expect(skill?.attributeKey).toBe('STRENGTH');

    const nonExistent = getSkillById('fake_skill');
    expect(nonExistent).toBeUndefined();
  });

  it('validates UnlockSkillSchema input correctly', () => {
    const valid = UnlockSkillSchema.safeParse({ skillId: 'str_t1_endurance' });
    expect(valid.success).toBe(true);

    const empty = UnlockSkillSchema.safeParse({ skillId: '' });
    expect(empty.success).toBe(false);

    const missing = UnlockSkillSchema.safeParse({});
    expect(missing.success).toBe(false);
  });
});
