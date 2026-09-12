import type { ShopItem, ItemCategory } from './economy';

export type EquipmentSlot = ItemCategory;

export interface EquippedItem {
  id: string;
  characterId: string;
  userId: string;
  slot: EquipmentSlot;
  itemId: string;
  purchaseId?: string;
  equippedAt: string;
  item?: ShopItem;
}

export type CharacterEquipmentMap = Partial<Record<EquipmentSlot, ShopItem>>;

export interface InventoryItem {
  id: string;
  characterId: string;
  userId: string;
  itemId: string;
  purchasedAt: string;
  pricePaid: number;
  item: ShopItem;
  isEquipped: boolean;
  equippedSlot?: EquipmentSlot;
}

export interface EquipResult {
  success: boolean;
  equipped?: {
    itemId: string;
    slot: EquipmentSlot;
    name: string;
  };
  replacedItemId?: string;
  error?: string;
}

export interface UnequipResult {
  success: boolean;
  unequipped?: {
    itemId: string;
    slot: EquipmentSlot;
    name: string;
  };
  error?: string;
}
