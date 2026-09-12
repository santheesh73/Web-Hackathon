import { describe, it, expect } from 'vitest';
import {
  DIFFICULTY_GOLD_MAP,
  BOSS_DIFFICULTY_GOLD_MAP,
  CHAIN_COMPLETION_GOLD,
  SEED_SHOP_ITEMS,
  getGoldForDifficulty,
  getGoldForBossDifficulty,
  formatGold,
} from '@shared/constants/economy';
import {
  ItemCategorySchema,
  PurchaseItemSchema,
  ShopFilterSchema,
} from '@shared/schemas/economy';

describe('Reward Engine Unit Tests', () => {
  it('correctly maps quest difficulty to gold rewards', () => {
    expect(getGoldForDifficulty('Easy')).toBe(5);
    expect(getGoldForDifficulty('Medium')).toBe(10);
    expect(getGoldForDifficulty('Hard')).toBe(25);
    expect(getGoldForDifficulty('UNKNOWN')).toBe(5); // fallback default
  });

  it('correctly maps boss difficulty to bounty gold', () => {
    expect(getGoldForBossDifficulty('Rare')).toBe(50);
    expect(getGoldForBossDifficulty('Epic')).toBe(100);
    expect(getGoldForBossDifficulty('Legendary')).toBe(250);
    expect(getGoldForBossDifficulty('UNKNOWN')).toBe(50);
  });

  it('provides chain completion gold bonus of 50', () => {
    expect(CHAIN_COMPLETION_GOLD).toBe(50);
  });

  it('formats gold amounts with currency symbol and name', () => {
    expect(formatGold(100)).toBe('◆ 100 GOLD');
    expect(formatGold(1500)).toBe('◆ 1,500 GOLD');
  });

  it('ensures all curated seed shop items meet economy requirements', () => {
    expect(SEED_SHOP_ITEMS.length).toBe(16);

    const categories = new Set(SEED_SHOP_ITEMS.map((item) => item.category));
    expect(categories.has('AVATAR')).toBe(true);
    expect(categories.has('THEME')).toBe(true);
    expect(categories.has('BADGE')).toBe(true);
    expect(categories.has('COSMETIC')).toBe(true);

    for (const item of SEED_SHOP_ITEMS) {
      expect(item.id).toBeDefined();
      expect(item.key).toBeDefined();
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(item.price).toBeGreaterThan(0);
      expect(item.isActive).toBe(true);
      expect(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).toContain(item.rarity);
    }
  });

  it('validates PurchaseItemSchema with Zod', () => {
    const valid = PurchaseItemSchema.safeParse({ itemId: '11111111-1111-4111-8111-000000000001' });
    expect(valid.success).toBe(true);

    const invalid = PurchaseItemSchema.safeParse({ itemId: '' });
    expect(invalid.success).toBe(false);
  });

  it('validates ItemCategorySchema and ShopFilterSchema with Zod', () => {
    expect(ItemCategorySchema.safeParse('AVATAR').success).toBe(true);
    expect(ItemCategorySchema.safeParse('THEME').success).toBe(true);
    expect(ItemCategorySchema.safeParse('BADGE').success).toBe(true);
    expect(ItemCategorySchema.safeParse('COSMETIC').success).toBe(true);
    expect(ItemCategorySchema.safeParse('INVALID').success).toBe(false);

    const validCategory = ShopFilterSchema.safeParse({ category: 'AVATAR', search: 'cyber' });
    expect(validCategory.success).toBe(true);

    const invalidCategory = ShopFilterSchema.safeParse({ category: 'WEAPON' });
    expect(invalidCategory.success).toBe(false);
  });

  it('exposes reward maps with standard difficulties', () => {
    expect(DIFFICULTY_GOLD_MAP['Easy']).toBe(5);
    expect(BOSS_DIFFICULTY_GOLD_MAP['Rare']).toBe(50);
  });
});
