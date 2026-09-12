import { z } from 'zod';

export const ItemCategorySchema = z.enum(['AVATAR', 'THEME', 'BADGE', 'COSMETIC']);

export const PurchaseItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export const ShopFilterSchema = z.object({
  category: ItemCategorySchema.optional(),
  search: z.string().optional(),
});

export type PurchaseItemInput = z.infer<typeof PurchaseItemSchema>;
export type ShopFilterInput = z.infer<typeof ShopFilterSchema>;
