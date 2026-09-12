import { z } from 'zod';

export const BossDifficultySchema = z.enum(['Rare', 'Epic', 'Legendary']);

export const BossStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']);

export const ObjectiveInputSchema = z.object({
  title: z.string().trim().min(1, 'Objective title is required').max(100, 'Objective title cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Objective description cannot exceed 500 characters').optional(),
  requiredProgress: z.number().int().min(1, 'Required progress must be at least 1').default(1),
});

export const CreateBossQuestSchema = z.object({
  title: z.string().trim().min(1, 'Boss title is required').max(100, 'Boss title cannot exceed 100 characters'),
  description: z.string().trim().max(1000, 'Boss description cannot exceed 1000 characters').optional(),
  difficulty: BossDifficultySchema,
  deadline: z.string().optional(),
  objectives: z.array(ObjectiveInputSchema).min(1, 'At least one objective is required'),
});

export const UpdateBossQuestSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  deadline: z.string().optional(),
  status: BossStatusSchema.optional(),
});

export const CreateBossObjectiveSchema = z.object({
  title: z.string().trim().min(1, 'Objective title is required').max(100, 'Objective title cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Objective description cannot exceed 500 characters').optional(),
  displayOrder: z.number().int().min(1).optional(),
  requiredProgress: z.number().int().min(1, 'Required progress must be at least 1').default(1),
});

export const UpdateBossObjectiveSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  displayOrder: z.number().int().min(1).optional(),
  requiredProgress: z.number().int().min(1).optional(),
});

export const LinkQuestSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
  objectiveId: z.string().min(1, 'Objective ID is required'),
});

export type CreateBossQuestInput = z.infer<typeof CreateBossQuestSchema>;
export type UpdateBossQuestInput = z.infer<typeof UpdateBossQuestSchema>;
export type CreateBossObjectiveInput = z.infer<typeof CreateBossObjectiveSchema>;
export type UpdateBossObjectiveInput = z.infer<typeof UpdateBossObjectiveSchema>;
export type LinkQuestInput = z.infer<typeof LinkQuestSchema>;
