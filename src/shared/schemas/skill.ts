import { z } from 'zod';

export const UnlockSkillSchema = z.object({
  skillId: z.string().min(1, 'Skill ID is required'),
});

export type UnlockSkillInput = z.infer<typeof UnlockSkillSchema>;
