import { describe, it, expect, beforeEach } from 'vitest';
import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';
import { saveCharacter } from '../../src/modules/character/routes';
import { resetRewardsStore, getShopItems } from '../../src/modules/rewards/routes';
import { resetInventoryStore } from '../../src/modules/inventory/routes';
import type { Character } from '@shared/types/character';

describe('Inventory and Equipment Integration Tests', () => {
  let app: FastifyInstance;
  const testUserId = 'test-inventory-user';
  const testCharId = 'char-inv-1';

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
    resetRewardsStore();
    resetInventoryStore();

    // Seed test character with 500 gold for purchases
    const testCharacter: Character = {
      id: testCharId,
      userId: testUserId,
      name: 'Gear Master',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 500,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCharacter(testCharacter);
  });

  it('GET /inventory returns empty array when user owns no items', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(res.statusCode).toBe(200);
    const items = JSON.parse(res.payload);
    expect(items).toEqual([]);
  });

  it('purchased item appears in GET /inventory with isEquipped: false', async () => {
    const allItems = getShopItems();
    const avatarItem = allItems.find((i) => i.key === 'avatar-cyber-samurai')!;

    // 1. Purchase item in Shop
    const buyRes = await app.inject({
      method: 'POST',
      url: `/shop/${avatarItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    expect(buyRes.statusCode).toBe(200);

    // 2. Query Inventory
    const invRes = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(invRes.statusCode).toBe(200);
    const inventory = JSON.parse(invRes.payload);
    expect(inventory.length).toBe(1);
    expect(inventory[0].itemId).toBe(avatarItem.id);
    expect(inventory[0].item.name).toBe(avatarItem.name);
    expect(inventory[0].isEquipped).toBe(false);
  });

  it('filters inventory items by category and search query', async () => {
    const allItems = getShopItems();
    const avatarItem = allItems.find((i) => i.category === 'AVATAR')!;
    const badgeItem = allItems.find((i) => i.category === 'BADGE')!;

    // Purchase both items
    await app.inject({
      method: 'POST',
      url: `/shop/${avatarItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    await app.inject({
      method: 'POST',
      url: `/shop/${badgeItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    // Filter by Category
    const badgeFilterRes = await app.inject({
      method: 'GET',
      url: '/inventory?category=BADGE',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const badgeItems = JSON.parse(badgeFilterRes.payload);
    expect(badgeItems.length).toBe(1);
    expect(badgeItems[0].item.category).toBe('BADGE');

    // Filter by Search Query
    const searchRes = await app.inject({
      method: 'GET',
      url: `/inventory?search=${encodeURIComponent(badgeItem.name.slice(0, 4))}`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const searchItems = JSON.parse(searchRes.payload);
    expect(searchItems.length).toBe(1);
    expect(searchItems[0].itemId).toBe(badgeItem.id);
  });

  it('equips an owned item and updates /character/equipment', async () => {
    const allItems = getShopItems();
    const avatarItem = allItems.find((i) => i.key === 'avatar-cyber-samurai')!;

    await app.inject({
      method: 'POST',
      url: `/shop/${avatarItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    // Equip item
    const equipRes = await app.inject({
      method: 'POST',
      url: `/inventory/${avatarItem.id}/equip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(equipRes.statusCode).toBe(200);
    const equipBody = JSON.parse(equipRes.payload);
    expect(equipBody.success).toBe(true);
    expect(equipBody.equipped.itemId).toBe(avatarItem.id);
    expect(equipBody.equipped.slot).toBe('AVATAR');

    // Verify GET /inventory marks item as isEquipped: true
    const invRes = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const inventory = JSON.parse(invRes.payload);
    expect(inventory[0].isEquipped).toBe(true);
    expect(inventory[0].equippedSlot).toBe('AVATAR');

    // Verify GET /character/equipment reflects equipped item
    const charEqRes = await app.inject({
      method: 'GET',
      url: '/character/equipment',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    expect(charEqRes.statusCode).toBe(200);
    const equipment = JSON.parse(charEqRes.payload);
    expect(equipment.AVATAR).toBeDefined();
    expect(equipment.AVATAR.id).toBe(avatarItem.id);
    expect(equipment.AVATAR.name).toBe(avatarItem.name);
  });

  it('enforces slot replacement: equipping second item replaces previous without deleting it', async () => {
    const allItems = getShopItems();
    const avatarA = allItems.find((i) => i.key === 'avatar-cyber-samurai')!;
    const avatarB = allItems.find((i) => i.key === 'avatar-solar-paladin')!;

    // Purchase both avatar items
    await app.inject({
      method: 'POST',
      url: `/shop/${avatarA.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });
    await app.inject({
      method: 'POST',
      url: `/shop/${avatarB.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    // Equip Avatar A
    await app.inject({
      method: 'POST',
      url: `/inventory/${avatarA.id}/equip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    // Equip Avatar B -> Should replace Avatar A
    const replaceRes = await app.inject({
      method: 'POST',
      url: `/inventory/${avatarB.id}/equip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(replaceRes.statusCode).toBe(200);
    const replaceBody = JSON.parse(replaceRes.payload);
    expect(replaceBody.success).toBe(true);
    expect(replaceBody.equipped.itemId).toBe(avatarB.id);
    expect(replaceBody.replacedItemId).toBe(avatarA.id);

    // Verify inventory state: both items owned, Avatar B is equipped, Avatar A is unequipped
    const invRes = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const inventory = JSON.parse(invRes.payload);
    expect(inventory.length).toBe(2);

    const invItemA = inventory.find((i: { itemId: string; isEquipped: boolean }) => i.itemId === avatarA.id);
    const invItemB = inventory.find((i: { itemId: string; isEquipped: boolean }) => i.itemId === avatarB.id);

    expect(invItemA.isEquipped).toBe(false);
    expect(invItemB.isEquipped).toBe(true);

    // Equipment map has Avatar B
    const eqRes = await app.inject({
      method: 'GET',
      url: '/character/equipment',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const equipment = JSON.parse(eqRes.payload);
    expect(equipment.AVATAR.id).toBe(avatarB.id);
  });

  it('unequips an item, clears the slot, and retains ownership in inventory', async () => {
    const allItems = getShopItems();
    const themeItem = allItems.find((i) => i.category === 'THEME')!;

    await app.inject({
      method: 'POST',
      url: `/shop/${themeItem.id}/purchase`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    await app.inject({
      method: 'POST',
      url: `/inventory/${themeItem.id}/equip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    // Unequip Theme
    const unequipRes = await app.inject({
      method: 'POST',
      url: `/inventory/${themeItem.id}/unequip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(unequipRes.statusCode).toBe(200);
    const unequipBody = JSON.parse(unequipRes.payload);
    expect(unequipBody.success).toBe(true);
    expect(unequipBody.unequipped.slot).toBe('THEME');

    // Slot is now empty
    const eqRes = await app.inject({
      method: 'GET',
      url: '/character/equipment',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const equipment = JSON.parse(eqRes.payload);
    expect(equipment.THEME).toBeUndefined();

    // Item remains in inventory as owned, unequipped
    const invRes = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${testUserId}` },
    });
    const inventory = JSON.parse(invRes.payload);
    expect(inventory.length).toBe(1);
    expect(inventory[0].isEquipped).toBe(false);
  });

  it('rejects attempt to equip an unowned item with 400 Bad Request', async () => {
    const allItems = getShopItems();
    const unownedItem = allItems[0];

    const equipRes = await app.inject({
      method: 'POST',
      url: `/inventory/${unownedItem.id}/equip`,
      headers: { authorization: `Bearer ${testUserId}` },
    });

    expect(equipRes.statusCode).toBe(400);
    const body = JSON.parse(equipRes.payload);
    expect(body.error).toContain('Item not owned');
  });

  it('enforces cross-user isolation and security', async () => {
    const userA = 'user-alice';
    const userB = 'user-bob';
    const allItems = getShopItems();
    const cosmeticItem = allItems.find((i) => i.category === 'COSMETIC')!;

    saveCharacter({
      id: 'char-alice',
      userId: userA,
      name: 'Alice',
      avatar: 'cyber-samurai',
      lifeFocus: 'career',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 500,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    saveCharacter({
      id: 'char-bob',
      userId: userB,
      name: 'Bob',
      avatar: 'scholar',
      lifeFocus: 'learning',
      xp: 0,
      level: 1,
      skillPoints: 0,
      gold: 500,
      evolutionTier: 1,
      evolutionTitle: 'Novice',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Alice purchases and equips cosmetic
    await app.inject({
      method: 'POST',
      url: `/shop/${cosmeticItem.id}/purchase`,
      headers: { authorization: `Bearer ${userA}` },
    });
    await app.inject({
      method: 'POST',
      url: `/inventory/${cosmeticItem.id}/equip`,
      headers: { authorization: `Bearer ${userA}` },
    });

    // Bob has 0 items in inventory
    const bobInv = await app.inject({
      method: 'GET',
      url: '/inventory',
      headers: { authorization: `Bearer ${userB}` },
    });
    expect(JSON.parse(bobInv.payload)).toEqual([]);

    // Bob CANNOT equip Alice's cosmetic item
    const bobEquip = await app.inject({
      method: 'POST',
      url: `/inventory/${cosmeticItem.id}/equip`,
      headers: { authorization: `Bearer ${userB}` },
    });
    expect(bobEquip.statusCode).toBe(400);
    expect(JSON.parse(bobEquip.payload).error).toContain('Item not owned');

    // Bob's equipment remains empty
    const bobEq = await app.inject({
      method: 'GET',
      url: '/character/equipment',
      headers: { authorization: `Bearer ${userB}` },
    });
    const bobEqBody = JSON.parse(bobEq.payload);
    expect(bobEqBody.COSMETIC).toBeUndefined();
  });
});
