export * from '@/../src/shared/types/inventory';
export * from '@/../src/shared/constants/inventory';
export * from '@/../src/shared/schemas/inventory';

export type InventoryFilterTab = 'ALL' | import('@/../src/shared/types/inventory').EquipmentSlot;
export type InventorySortOption = 'RECENT' | 'NAME' | 'CATEGORY';

export interface InventoryUIState {
  items: import('@/../src/shared/types/inventory').InventoryItem[];
  equipment: import('@/../src/shared/types/inventory').CharacterEquipmentMap;
  loading: boolean;
  actionLoadingId: string | null;
  error: string | null;
  selectedFilter: InventoryFilterTab;
  searchQuery: string;
  sortBy: InventorySortOption;
}
