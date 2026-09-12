import { z } from 'zod';

export const LifeFocusSchema = z.enum([
  'health',
  'learning',
  'career',
  'finance',
  'creativity',
  'personal',
]);

export const CharacterCreationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Character name must be at least 3 characters')
    .max(24, 'Character name must be at most 24 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Character name can only contain letters, numbers, spaces, underscores, and hyphens'),
  avatar: z.string().min(1, 'Please select an avatar'),
  lifeFocus: LifeFocusSchema,
});

export type CharacterCreationInput = z.infer<typeof CharacterCreationSchema>;
