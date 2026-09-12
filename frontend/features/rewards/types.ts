export * from '@/../src/shared/types/economy';
export * from '@/../src/shared/constants/economy';
export * from '@/../src/shared/schemas/economy';

export type ShopCategoryTab = 'ALL' | 'AVATAR' | 'THEME' | 'BADGE' | 'COSMETIC';

export interface ShopState {
  items: import('@/../src/shared/types/economy').ShopItemWithOwnership[];
  loading: boolean;
  purchasingItemId: string | null;
  error: string | null;
  selectedCategory: ShopCategoryTab;
  searchQuery: string;
}
