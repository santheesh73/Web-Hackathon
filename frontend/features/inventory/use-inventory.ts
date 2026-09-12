'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import type {
  EquipmentSlot,
  InventoryItem,
  CharacterEquipmentMap,
  EquipResult,
  UnequipResult,
} from '@/../src/shared/types/inventory';
import type { ShopItem, Purchase } from '@/../src/shared/types/economy';
import { SEED_SHOP_ITEMS } from '@/../src/shared/constants/economy';
import type { InventoryFilterTab, InventorySortOption } from './types';
import { filterAndSortInventory, calculateInventoryStats } from './inventory-engine';

const PURCHASES_KEY_PREFIX = 'life_rpg_purchases_';
const EQUIPMENT_KEY_PREFIX = 'life_rpg_equipment_';

export function useInventory() {
  const { user } = useAuth();
  const { character } = useCharacter();
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = React.useState<CharacterEquipmentMap>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = React.useState<InventoryFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<InventorySortOption>('RECENT');

  const configured = isSupabaseConfigured();

  const fetchInventoryData = React.useCallback(async () => {
    if (!user) {
      setItems([]);
      setEquipment({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // 1. Fetch character's equipment
        const { data: equipRows, error: equipErr } = await supabase
          .from('character_equipment')
          .select('*, shop_items(*)')
          .eq('user_id', user.id);

        if (equipErr) {
          console.error('Error fetching character equipment:', equipErr);
        }

        const equipMap: CharacterEquipmentMap = {};
        const equippedItemIds = new Set<string>();

        (equipRows || []).forEach((row: any) => {
          const slot = row.slot as EquipmentSlot;
          const shopItemData = row.shop_items;
          if (shopItemData) {
            const mappedItem: ShopItem = {
              id: shopItemData.id,
              key: shopItemData.key,
              name: shopItemData.name,
              description: shopItemData.description,
              category: shopItemData.category,
              price: shopItemData.price,
              icon: shopItemData.icon,
              previewColor: shopItemData.preview_color,
              rarity: shopItemData.rarity,
              metadata: shopItemData.metadata,
              isActive: shopItemData.is_active,
              createdAt: shopItemData.created_at,
              updatedAt: shopItemData.updated_at,
            };
            equipMap[slot] = mappedItem;
            equippedItemIds.add(shopItemData.id);
          }
        });

        // 2. Fetch purchases (owned inventory items)
        const { data: purchaseRows, error: purchErr } = await supabase
          .from('purchases')
          .select('*, shop_items(*)')
          .eq('user_id', user.id)
          .order('purchased_at', { ascending: false });

        if (purchErr) {
          setError(purchErr.message);
          setLoading(false);
          return;
        }

        const inventoryItems: InventoryItem[] = (purchaseRows || []).map((row: any) => {
          const shopItem = row.shop_items;
          const isEquipped = equippedItemIds.has(shopItem.id);
          const equippedSlot = isEquipped ? (shopItem.category as EquipmentSlot) : undefined;

          return {
            id: row.id,
            characterId: row.character_id,
            userId: row.user_id,
            itemId: row.item_id,
            purchasedAt: row.purchased_at,
            pricePaid: row.price_paid,
            item: {
              id: shopItem.id,
              key: shopItem.key,
              name: shopItem.name,
              description: shopItem.description,
              category: shopItem.category,
              price: shopItem.price,
              icon: shopItem.icon,
              previewColor: shopItem.preview_color,
              rarity: shopItem.rarity,
              metadata: shopItem.metadata,
              isActive: shopItem.is_active,
              createdAt: shopItem.created_at,
              updatedAt: shopItem.updated_at,
            },
            isEquipped,
            equippedSlot,
          };
        });

        setEquipment(equipMap);
        setItems(inventoryItems);
      } else {
        // LocalStorage fallback mode
        const pKey = `${PURCHASES_KEY_PREFIX}${user.id}`;
        const eqKey = `${EQUIPMENT_KEY_PREFIX}${user.id}`;

        const storedPurchases: Purchase[] = JSON.parse(localStorage.getItem(pKey) || '[]');
        const storedEquipment: CharacterEquipmentMap = JSON.parse(localStorage.getItem(eqKey) || '{}');

        // Create a lookup for seed shop items
        const itemMap = new Map<string, ShopItem>(
          SEED_SHOP_ITEMS.map((i) => [
            i.id,
            {
              ...i,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ])
        );

        const equippedItemIds = new Set<string>(
          Object.values(storedEquipment)
            .filter((item): item is ShopItem => Boolean(item))
            .map((item) => item.id)
        );

        const inventoryItems: InventoryItem[] = storedPurchases.map((p) => {
          const item = p.item || itemMap.get(p.itemId) || {
            id: p.itemId,
            key: 'unknown',
            name: 'Unknown Item',
            description: 'Item details unavailable',
            category: 'COSMETIC',
            price: p.pricePaid,
            icon: 'Sparkles',
            rarity: 'COMMON',
            isActive: true,
            createdAt: p.purchasedAt,
            updatedAt: p.purchasedAt,
          };

          const isEquipped = equippedItemIds.has(item.id);
          const equippedSlot = isEquipped ? (item.category as EquipmentSlot) : undefined;

          return {
            id: p.id,
            characterId: p.characterId,
            userId: p.userId,
            itemId: p.itemId,
            purchasedAt: p.purchasedAt,
            pricePaid: p.pricePaid,
            item,
            isEquipped,
            equippedSlot,
          };
        });

        setEquipment(storedEquipment);
        setItems(inventoryItems);
      }
    } catch {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user, configured]);

  React.useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Equip Item
  const equipItem = async (item: ShopItem): Promise<EquipResult> => {
    if (!user) {
      return { success: false, error: 'User must be authenticated to equip items.' };
    }

    const isOwned = items.some((i) => i.itemId === item.id);
    if (!isOwned) {
      return { success: false, error: 'Cannot equip unowned item. Purchase it in the Shop first.' };
    }

    setActionLoadingId(item.id);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: rpcErr } = await supabase.rpc('equip_item', {
          p_item_id: item.id,
        });

        if (rpcErr) {
          setError(rpcErr.message);
          return { success: false, error: rpcErr.message };
        }

        await fetchInventoryData();
        return {
          success: true,
          equipped: data.equipped,
          replacedItemId: data.replacedItemId,
        };
      } else {
        // LocalStorage fallback
        const eqKey = `${EQUIPMENT_KEY_PREFIX}${user.id}`;
        const storedEquipment: CharacterEquipmentMap = JSON.parse(localStorage.getItem(eqKey) || '{}');

        const slot = item.category as EquipmentSlot;
        const previousItem = storedEquipment[slot];

        storedEquipment[slot] = item;
        localStorage.setItem(eqKey, JSON.stringify(storedEquipment));

        setEquipment(storedEquipment);
        setItems((prev) =>
          prev.map((inv) => {
            if (inv.itemId === item.id) {
              return { ...inv, isEquipped: true, equippedSlot: slot };
            }
            if (inv.item.category === slot && inv.itemId !== item.id) {
              return { ...inv, isEquipped: false, equippedSlot: undefined };
            }
            return inv;
          })
        );

        return {
          success: true,
          equipped: {
            itemId: item.id,
            slot,
            name: item.name,
          },
          replacedItemId: previousItem ? previousItem.id : undefined,
        };
      }
    } catch {
      const msg = 'Failed to equip item.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Unequip Slot
  const unequipSlot = async (slot: EquipmentSlot): Promise<UnequipResult> => {
    if (!user) {
      return { success: false, error: 'User must be authenticated.' };
    }

    if (!equipment[slot]) {
      return { success: false, error: `No item currently equipped in slot: ${slot}` };
    }

    setActionLoadingId(slot);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: rpcErr } = await supabase.rpc('unequip_item', {
          p_slot: slot,
        });

        if (rpcErr) {
          setError(rpcErr.message);
          return { success: false, error: rpcErr.message };
        }

        await fetchInventoryData();
        return {
          success: true,
          unequipped: data.unequipped,
        };
      } else {
        // LocalStorage fallback
        const eqKey = `${EQUIPMENT_KEY_PREFIX}${user.id}`;
        const storedEquipment: CharacterEquipmentMap = JSON.parse(localStorage.getItem(eqKey) || '{}');
        const removedItem = storedEquipment[slot];

        delete storedEquipment[slot];
        localStorage.setItem(eqKey, JSON.stringify(storedEquipment));

        setEquipment(storedEquipment);
        setItems((prev) =>
          prev.map((inv) =>
            inv.item.category === slot ? { ...inv, isEquipped: false, equippedSlot: undefined } : inv
          )
        );

        return {
          success: true,
          unequipped: removedItem
            ? {
                itemId: removedItem.id,
                slot,
                name: removedItem.name,
              }
            : undefined,
        };
      }
    } catch {
      const msg = 'Failed to unequip slot.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = React.useMemo(() => {
    return filterAndSortInventory(items, selectedFilter, searchQuery, sortBy);
  }, [items, selectedFilter, searchQuery, sortBy]);

  const stats = React.useMemo(() => {
    return calculateInventoryStats(items, equipment);
  }, [items, equipment]);

  return {
    items: filteredItems,
    allItems: items,
    equipment,
    loading,
    actionLoadingId,
    error,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    equipItem,
    unequipSlot,
    refetch: fetchInventoryData,
    stats,
  };
}
