import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import type {
  EquipmentSlot,
  EquippedItem,
  InventoryItem,
  CharacterEquipmentMap,
} from '../../../../src/shared/types/inventory';
import type { ShopItem } from '../../../../src/shared/types/economy';
import { isValidEquipmentSlot } from '../../../../src/shared/constants/inventory';
import { getCharacterByUserId } from '../character/routes';
import {
  getShopItemById,
  getPurchasesForCharacter,
} from '../rewards/routes';

// In-memory equipment store: characterId -> Map(slot -> EquippedItem)
const characterEquipment = new Map<string, Map<EquipmentSlot, EquippedItem>>();

export function getEquippedItemsForCharacter(characterId: string): EquippedItem[] {
  const charSlots = characterEquipment.get(characterId);
  if (!charSlots) return [];
  return Array.from(charSlots.values());
}

export function getEquippedItemForSlot(
  characterId: string,
  slot: EquipmentSlot
): EquippedItem | undefined {
  const charSlots = characterEquipment.get(characterId);
  return charSlots?.get(slot);
}

export function equipItemForCharacter(
  characterId: string,
  item: ShopItem,
  userId: string,
  purchaseId?: string
): { equipped: EquippedItem; replaced?: EquippedItem } {
  let charSlots = characterEquipment.get(characterId);
  if (!charSlots) {
    charSlots = new Map<EquipmentSlot, EquippedItem>();
    characterEquipment.set(characterId, charSlots);
  }

  const slot = item.category as EquipmentSlot;
  const replaced = charSlots.get(slot);

  const equipped: EquippedItem = {
    id: randomUUID(),
    characterId,
    userId,
    slot,
    itemId: item.id,
    purchaseId,
    equippedAt: new Date().toISOString(),
    item,
  };

  charSlots.set(slot, equipped);
  return { equipped, replaced };
}

export function unequipSlotForCharacter(
  characterId: string,
  slot: EquipmentSlot
): EquippedItem | undefined {
  const charSlots = characterEquipment.get(characterId);
  if (!charSlots) return undefined;
  const existing = charSlots.get(slot);
  charSlots.delete(slot);
  return existing;
}

export function resetInventoryStore(): void {
  characterEquipment.clear();
}

export const inventoryRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /inventory - retrieve all owned items for authenticated character
  app.get('/inventory', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    const purchases = getPurchasesForCharacter(character.id);
    const equippedSlots = characterEquipment.get(character.id) || new Map<EquipmentSlot, EquippedItem>();

    let inventoryItems: InventoryItem[] = purchases.map((purchase) => {
      const item = purchase.item || getShopItemById(purchase.itemId)!;
      const slot = item.category as EquipmentSlot;
      const equippedInSlot = equippedSlots.get(slot);
      const isEquipped = equippedInSlot?.itemId === item.id;

      return {
        id: purchase.id,
        characterId: character.id,
        userId,
        itemId: item.id,
        purchasedAt: purchase.purchasedAt,
        pricePaid: purchase.pricePaid,
        item,
        isEquipped,
        equippedSlot: isEquipped ? slot : undefined,
      };
    });

    const query = request.query as {
      category?: string;
      search?: string;
      sortBy?: 'RECENT' | 'NAME' | 'CATEGORY';
    };

    // Filter by Category
    if (query?.category && query.category !== 'ALL') {
      inventoryItems = inventoryItems.filter((i) => i.item.category === query.category);
    }

    // Filter by Search Query
    if (query?.search?.trim()) {
      const s = query.search.toLowerCase().trim();
      inventoryItems = inventoryItems.filter(
        (i) =>
          i.item.name.toLowerCase().includes(s) ||
          i.item.description.toLowerCase().includes(s) ||
          i.item.category.toLowerCase().includes(s)
      );
    }

    // Sort items
    const sortBy = query?.sortBy || 'RECENT';
    if (sortBy === 'NAME') {
      inventoryItems.sort((a, b) => a.item.name.localeCompare(b.item.name));
    } else if (sortBy === 'CATEGORY') {
      inventoryItems.sort((a, b) => a.item.category.localeCompare(b.item.category));
    } else {
      // RECENT: newest purchases first, with equipped items prioritized
      inventoryItems.sort((a, b) => {
        if (a.isEquipped && !b.isEquipped) return -1;
        if (!a.isEquipped && b.isEquipped) return 1;
        return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
      });
    }

    return reply.status(200).send(inventoryItems);
  });

  // GET /inventory/:itemId - retrieve details for a single owned inventory item
  app.get('/inventory/:itemId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { itemId } = request.params as { itemId: string };

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    const purchases = getPurchasesForCharacter(character.id);
    const purchase = purchases.find((p) => p.itemId === itemId);
    if (!purchase) {
      return reply.status(404).send({ error: 'Item not found in inventory' });
    }

    const item = purchase.item || getShopItemById(purchase.itemId)!;
    const slot = item.category as EquipmentSlot;
    const equippedInSlot = getEquippedItemForSlot(character.id, slot);
    const isEquipped = equippedInSlot?.itemId === item.id;

    const result: InventoryItem = {
      id: purchase.id,
      characterId: character.id,
      userId,
      itemId: item.id,
      purchasedAt: purchase.purchasedAt,
      pricePaid: purchase.pricePaid,
      item,
      isEquipped,
      equippedSlot: isEquipped ? slot : undefined,
    };

    return reply.status(200).send(result);
  });

  // POST /inventory/:itemId/equip - equip an owned item (replaces any item in same slot)
  app.post('/inventory/:itemId/equip', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { itemId } = request.params as { itemId: string };

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    // Verify ownership
    const purchases = getPurchasesForCharacter(character.id);
    const purchase = purchases.find((p) => p.itemId === itemId);
    if (!purchase) {
      return reply.status(400).send({
        error: 'Item not owned. You must purchase this item before equipping.',
      });
    }

    const item = purchase.item || getShopItemById(itemId);
    if (!item || !item.isActive) {
      return reply.status(404).send({ error: 'Item not found or unavailable' });
    }

    const slot = item.category as EquipmentSlot;
    if (!isValidEquipmentSlot(slot)) {
      return reply.status(400).send({ error: `Invalid equipment slot: ${slot}` });
    }

    // Perform atomic slot assignment (replaces previous item)
    const { equipped, replaced } = equipItemForCharacter(
      character.id,
      item,
      userId,
      purchase.id
    );

    return reply.status(200).send({
      success: true,
      equipped: {
        itemId: equipped.itemId,
        slot: equipped.slot,
        name: item.name,
      },
      replacedItemId: replaced && replaced.itemId !== item.id ? replaced.itemId : undefined,
    });
  });

  // POST /inventory/:itemId/unequip - unequip an equipped item
  app.post('/inventory/:itemId/unequip', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { itemId } = request.params as { itemId: string };

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    // Verify item exists and check ownership
    const purchases = getPurchasesForCharacter(character.id);
    const purchase = purchases.find((p) => p.itemId === itemId);
    if (!purchase) {
      return reply.status(400).send({
        error: 'Item not owned. You cannot unequip an unowned item.',
      });
    }

    const item = purchase.item || getShopItemById(itemId);
    if (!item) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    const slot = item.category as EquipmentSlot;
    const currentlyEquipped = getEquippedItemForSlot(character.id, slot);
    if (!currentlyEquipped || currentlyEquipped.itemId !== item.id) {
      return reply.status(400).send({
        error: 'Item is not currently equipped in this slot.',
      });
    }

    // Remove from equipment slot
    unequipSlotForCharacter(character.id, slot);

    return reply.status(200).send({
      success: true,
      unequipped: {
        itemId: item.id,
        slot,
        name: item.name,
      },
    });
  });

  // GET /character/equipment - retrieve all equipped items for authenticated character
  app.get('/character/equipment', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    const equippedList = getEquippedItemsForCharacter(character.id);
    const equipmentMap: CharacterEquipmentMap = {
      AVATAR: undefined,
      THEME: undefined,
      BADGE: undefined,
      COSMETIC: undefined,
    };

    for (const eq of equippedList) {
      equipmentMap[eq.slot] = eq.item || getShopItemById(eq.itemId);
    }

    return reply.status(200).send(equipmentMap);
  });
};
