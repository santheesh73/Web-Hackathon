import { describe, it, expect } from 'vitest';
import { QuestChainCreationSchema } from '@shared/schemas/quest-chain';

describe('QuestChainCreationSchema - Unit Tests', () => {
  it('validates a correct quest chain input with steps', () => {
    const valid = {
      title: 'Master Frontend Engineering',
      description: 'Step-by-step roadmap from TypeScript to production deployment',
      steps: [
        {
          title: 'Master TypeScript Generics',
          category: 'Learning',
          difficulty: 'Medium',
        },
        {
          title: 'Build Accessible Design System',
          category: 'Learning',
          difficulty: 'Hard',
        },
      ],
    };

    const result = QuestChainCreationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects chain title shorter than 3 characters', () => {
    const invalid = {
      title: 'Go',
      steps: [
        { title: 'Step One', category: 'Learning', difficulty: 'Easy' },
        { title: 'Step Two', category: 'Learning', difficulty: 'Easy' },
      ],
    };

    const result = QuestChainCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 3 characters');
    }
  });

  it('rejects chain title longer than 100 characters', () => {
    const invalid = {
      title: 'A'.repeat(101),
      steps: [
        { title: 'Step One', category: 'Learning', difficulty: 'Easy' },
        { title: 'Step Two', category: 'Learning', difficulty: 'Easy' },
      ],
    };

    const result = QuestChainCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('cannot exceed 100 characters');
    }
  });

  it('rejects chains with fewer than 2 steps', () => {
    const invalid = {
      title: 'Too Short Chain',
      steps: [{ title: 'Only One Step', category: 'Career', difficulty: 'Medium' }],
    };

    const result = QuestChainCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 2 steps');
    }
  });

  it('rejects steps with invalid quest titles', () => {
    const invalid = {
      title: 'Valid Chain Title',
      steps: [
        { title: 'Valid Step One', category: 'Learning', difficulty: 'Easy' },
        { title: 'No', category: 'Learning', difficulty: 'Easy' }, // < 3 chars
      ],
    };

    const result = QuestChainCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
