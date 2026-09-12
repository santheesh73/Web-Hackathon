import {
  ItemCategory,
  ItemRarity,
} from '@/../src/shared/types/economy';
import {
  CURRENCY_NAME,
  CURRENCY_SYMBOL,
  DIFFICULTY_GOLD_MAP,
  BOSS_DIFFICULTY_GOLD_MAP,
  CHAIN_COMPLETION_GOLD,
  SEED_SHOP_ITEMS,
  getGoldForDifficulty,
  getGoldForBossDifficulty,
  formatGold,
} from '@/../src/shared/constants/economy';

export {
  CURRENCY_NAME,
  CURRENCY_SYMBOL,
  DIFFICULTY_GOLD_MAP,
  BOSS_DIFFICULTY_GOLD_MAP,
  CHAIN_COMPLETION_GOLD,
  SEED_SHOP_ITEMS,
  getGoldForDifficulty,
  getGoldForBossDifficulty,
  formatGold,
};

export function getRarityBadgeVariant(
  rarity?: ItemRarity
): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'rpg' {
  switch (rarity) {
    case 'LEGENDARY':
      return 'rpg';
    case 'EPIC':
      return 'warning';
    case 'RARE':
      return 'info';
    case 'COMMON':
    default:
      return 'neutral';
  }
}

export function getRarityColorClass(rarity?: ItemRarity): string {
  switch (rarity) {
    case 'LEGENDARY':
      return 'text-amber-500 border-amber-500/40 bg-amber-500/10';
    case 'EPIC':
      return 'text-purple-500 border-purple-500/40 bg-purple-500/10';
    case 'RARE':
      return 'text-sky-500 border-sky-500/40 bg-sky-500/10';
    case 'COMMON':
    default:
      return 'text-slate-500 border-slate-500/40 bg-slate-500/10';
  }
}

export function getCategoryLabel(category: ItemCategory): string {
  switch (category) {
    case 'AVATAR':
      return 'Avatar Archetype';
    case 'THEME':
      return 'Visual Theme';
    case 'BADGE':
      return 'Achievement Badge';
    case 'COSMETIC':
      return 'Cosmetic Flair';
    default:
      return category;
  }
}

export function canAffordItem(characterGold: number, itemPrice: number): boolean {
  return characterGold >= itemPrice;
}

export function calculateShortfall(characterGold: number, itemPrice: number): number {
  return Math.max(0, itemPrice - characterGold);
}
