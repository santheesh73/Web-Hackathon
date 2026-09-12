import { describe, it, expect } from 'vitest';
import { QuestCreationSchema } from '@shared/schemas/quest';

describe('QuestCreationSchema - Unit Tests', () => {
  it('validates valid quest creation data', () => {
    const valid = {
      title: 'Complete 30-minute cardio session',
      description: 'Morning jog around the neighborhood park',
      category: 'Health',
      difficulty: 'Medium',
      dueDate: '2026-09-15',
    };

    const result = QuestCreationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('allows optional description and dueDate to be omitted or empty', () => {
    const minimal = {
      title: 'Read 20 pages of book',
      category: 'Learning',
      difficulty: 'Easy',
    };

    const result = QuestCreationSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 3 characters', () => {
    const invalid = {
      title: 'Hi',
      category: 'Career',
      difficulty: 'Easy',
    };

    const result = QuestCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 3 characters');
    }
  });

  it('rejects title longer than 80 characters', () => {
    const invalid = {
      title: 'A'.repeat(81),
      category: 'Career',
      difficulty: 'Hard',
    };

    const result = QuestCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('cannot exceed 80 characters');
    }
  });

  it('rejects invalid category', () => {
    const invalid = {
      title: 'Valid Quest Title',
      category: 'GamingStream',
      difficulty: 'Easy',
    };

    const result = QuestCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid difficulty', () => {
    const invalid = {
      title: 'Valid Quest Title',
      category: 'Health',
      difficulty: 'Impossible',
    };

    const result = QuestCreationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
