import type { EquipmentSlot, InventoryItem, CharacterEquipmentMap } from '@/../src/shared/types/inventory';
import type { InventoryFilterTab, InventorySortOption } from './types';

export function filterAndSortInventory(
  items: InventoryItem[],
  filter: InventoryFilterTab,
  search: string,
  sortBy: InventorySortOption
): InventoryItem[] {
  let result = [...items];

  // 1. Filter by Slot / Category
  if (filter !== 'ALL') {
    result = result.filter((item) => item.item.category === filter);
  }

  // 2. Search query filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.item.name.toLowerCase().includes(q) ||
        item.item.description.toLowerCase().includes(q) ||
        item.item.category.toLowerCase().includes(q) ||
        (item.item.rarity && item.item.rarity.toLowerCase().includes(q))
    );
  }

  // 3. Sort
  result.sort((a, b) => {
    // Prioritize equipped items first in general listing
    if (a.isEquipped && !b.isEquipped) return -1;
    if (!a.isEquipped && b.isEquipped) return 1;

    switch (sortBy) {
      case 'NAME':
        return a.item.name.localeCompare(b.item.name);
      case 'CATEGORY':
        return a.item.category.localeCompare(b.item.category);
      case 'RECENT':
      default:
        return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
    }
  });

  return result;
}

export function calculateInventoryStats(items: InventoryItem[], equipment: CharacterEquipmentMap) {
  const totalOwned = items.length;
  const equippedCount = Object.keys(equipment).length;
  const categoryCounts: Record<EquipmentSlot, number> = {
    AVATAR: items.filter((i) => i.item.category === 'AVATAR').length,
    THEME: items.filter((i) => i.item.category === 'THEME').length,
    BADGE: items.filter((i) => i.item.category === 'BADGE').length,
    COSMETIC: items.filter((i) => i.item.category === 'COSMETIC').length,
  };

  return {
    totalOwned,
    equippedCount,
    categoryCounts,
  };
}
