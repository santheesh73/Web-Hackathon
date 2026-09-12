import { z } from 'zod';

export const EquipmentSlotSchema = z.enum(['AVATAR', 'THEME', 'BADGE', 'COSMETIC']);

export const EquipItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export const UnequipItemSchema = z.object({
  slot: EquipmentSlotSchema.optional(),
  itemId: z.string().optional(),
});

export const InventoryFilterSchema = z.object({
  category: z.enum(['ALL', 'AVATAR', 'THEME', 'BADGE', 'COSMETIC']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['RECENT', 'NAME', 'CATEGORY']).optional(),
});

export type EquipItemInput = z.infer<typeof EquipItemSchema>;
export type UnequipItemInput = z.infer<typeof UnequipItemSchema>;
export type InventoryFilterInput = z.infer<typeof InventoryFilterSchema>;
