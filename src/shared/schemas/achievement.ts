import { z } from 'zod';

export const AchievementCategorySchema = z.enum([
  'QUESTS',
  'STREAKS',
  'QUEST_CHAINS',
  'BOSS_QUESTS',
  'PROGRESSION',
  'SKILLS',
  'ECONOMY',
  'INVENTORY',
]);

export const RequirementTypeSchema = z.enum([
  'QUEST_COUNT',
  'STREAK_DAYS',
  'QUEST_CHAIN_COUNT',
  'BOSS_COMPLETION_COUNT',
  'PLAYER_LEVEL',
  'SKILL_COUNT',
  'GOLD_EARNED',
  'ITEM_COUNT',
  'EQUIPPED_ITEM_COUNT',
]);

export const AchievementFilterSchema = z.object({
  status: z.enum(['ALL', 'UNLOCKED', 'IN_PROGRESS', 'LOCKED']).optional(),
  category: AchievementCategorySchema.optional(),
  search: z.string().optional(),
  sortBy: z.enum(['RECENT', 'PROGRESS', 'NAME']).optional(),
});

export type AchievementFilterInput = z.infer<typeof AchievementFilterSchema>;
