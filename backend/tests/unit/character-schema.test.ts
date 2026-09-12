import { describe, it, expect } from 'vitest';
import { CharacterCreationSchema } from '@shared/schemas/character';

describe('CharacterCreationSchema', () => {
  it('validates a correct character creation input', () => {
    const input = {
      name: 'Valerius',
      avatar: 'warrior',
      lifeFocus: 'learning',
    };
    const result = CharacterCreationSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects character names shorter than 3 characters', () => {
    const input = {
      name: 'Al',
      avatar: 'warrior',
      lifeFocus: 'learning',
    };
    const result = CharacterCreationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 3 characters');
    }
  });

  it('rejects character names longer than 24 characters', () => {
    const input = {
      name: 'A'.repeat(25),
      avatar: 'warrior',
      lifeFocus: 'health',
    };
    const result = CharacterCreationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at most 24 characters');
    }
  });

  it('rejects invalid life focus categories', () => {
    const input = {
      name: 'Solon',
      avatar: 'scholar',
      lifeFocus: 'gambling',
    };
    const result = CharacterCreationSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
