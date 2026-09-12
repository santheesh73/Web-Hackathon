import { z } from 'zod';

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('life-rpg-api'),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
