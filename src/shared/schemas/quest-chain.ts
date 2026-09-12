import { z } from 'zod';
import { QuestCategorySchema, QuestDifficultySchema } from './quest';

export const ChainStepCreationItemSchema = z.object({
  questId: z.string().min(1).optional(),
  title: z
    .string()
    .trim()
    .min(3, 'Step quest title must be at least 3 characters')
    .max(80, 'Step quest title cannot exceed 80 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  category: QuestCategorySchema.default('Learning'),
  difficulty: QuestDifficultySchema.default('Medium'),
});

export const QuestChainCreationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Chain title must be at least 3 characters')
    .max(100, 'Chain title cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
  steps: z
    .array(ChainStepCreationItemSchema)
    .min(2, 'A quest chain must contain at least 2 steps')
    .max(20, 'A quest chain cannot exceed 20 steps'),
});

export type ChainStepCreationItem = z.infer<typeof ChainStepCreationItemSchema>;
export type QuestChainCreationInput = z.infer<typeof QuestChainCreationSchema>;
