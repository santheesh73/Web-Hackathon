import { z } from 'zod';

export const StreakRecoverySchema = z.object({
  // No client-specified streak value; request can carry optional client timezone for validation logging
  clientDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});

export type StreakRecoveryInput = z.infer<typeof StreakRecoverySchema>;
