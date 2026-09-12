export type ItemCategory = 'AVATAR' | 'THEME' | 'BADGE' | 'COSMETIC';

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface ShopItem {
  id: string;
  key: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  icon?: string;
  previewColor?: string;
  rarity?: ItemRarity;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopItemWithOwnership extends ShopItem {
  isOwned: boolean;
  purchasedAt?: string;
}

export interface Purchase {
  id: string;
  characterId: string;
  userId: string;
  itemId: string;
  pricePaid: number;
  purchasedAt: string;
  item?: ShopItem;
}

export type EconomyTransactionType = 'EARN' | 'SPEND';

export type EconomyTransactionSource =
  | 'QUEST_COMPLETION'
  | 'CHAIN_COMPLETION'
  | 'BOSS_COMPLETION'
  | 'SHOP_PURCHASE'
  | 'SYSTEM_GRANT'
  | 'MILESTONE_BONUS';

export interface EconomyTransaction {
  id: string;
  characterId: string;
  userId: string;
  type: EconomyTransactionType;
  amount: number;
  balanceAfter: number;
  source: EconomyTransactionSource;
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface PurchaseResult {
  success: boolean;
  purchase?: Purchase;
  remainingGold?: number;
  item?: ShopItem;
  error?: string;
}

export interface RewardsSummary {
  totalGold: number;
  totalEarned: number;
  totalSpent: number;
  recentTransactions: EconomyTransaction[];
  ownedItemsCount: number;
}
