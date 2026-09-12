import { z } from 'zod';

export const QuestCategorySchema = z.enum([
  'Health',
  'Learning',
  'Career',
  'Finance',
  'Personal',
  'Creativity',
]);

export const QuestDifficultySchema = z.enum(['Easy', 'Medium', 'Hard']);

export const QuestStatusSchema = z.enum(['ACTIVE', 'COMPLETED']);

export const QuestCreationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Quest title must be at least 3 characters')
    .max(80, 'Quest title cannot exceed 80 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  category: QuestCategorySchema,
  difficulty: QuestDifficultySchema,
  dueDate: z.string().optional(),
});

export type QuestCreationInput = z.infer<typeof QuestCreationSchema>;
