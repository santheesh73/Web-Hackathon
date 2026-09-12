import { describe, it, expect } from 'vitest';
import {
  EQUIPMENT_SLOTS,
  EQUIPMENT_SLOT_LABELS,
  isValidEquipmentSlot,
  getEquipmentSlotLabel,
} from '@shared/constants/inventory';
import {
  EquipmentSlotSchema,
  EquipItemSchema,
  UnequipItemSchema,
  InventoryFilterSchema,
} from '@shared/schemas/inventory';

describe('Inventory & Equipment Engine Unit Tests', () => {
  it('validates supported equipment slots match the productivity RPG model', () => {
    expect(EQUIPMENT_SLOTS).toEqual(['AVATAR', 'THEME', 'BADGE', 'COSMETIC']);
    expect(isValidEquipmentSlot('AVATAR')).toBe(true);
    expect(isValidEquipmentSlot('THEME')).toBe(true);
    expect(isValidEquipmentSlot('BADGE')).toBe(true);
    expect(isValidEquipmentSlot('COSMETIC')).toBe(true);
    expect(isValidEquipmentSlot('WEAPON')).toBe(false);
    expect(isValidEquipmentSlot('ARMOR')).toBe(false);
    expect(isValidEquipmentSlot('HELMET')).toBe(false);
  });

  it('maps equipment slot labels correctly', () => {
    expect(getEquipmentSlotLabel('AVATAR')).toBe('Avatar Archetype');
    expect(getEquipmentSlotLabel('THEME')).toBe('Visual Theme');
    expect(getEquipmentSlotLabel('BADGE')).toBe('Displayed Badge');
    expect(getEquipmentSlotLabel('COSMETIC')).toBe('Cosmetic Flair');
    expect(EQUIPMENT_SLOT_LABELS['AVATAR']).toBeDefined();
  });

  it('validates EquipmentSlotSchema with Zod', () => {
    expect(EquipmentSlotSchema.safeParse('AVATAR').success).toBe(true);
    expect(EquipmentSlotSchema.safeParse('THEME').success).toBe(true);
    expect(EquipmentSlotSchema.safeParse('BADGE').success).toBe(true);
    expect(EquipmentSlotSchema.safeParse('COSMETIC').success).toBe(true);
    expect(EquipmentSlotSchema.safeParse('SHIELD').success).toBe(false);
  });

  it('validates EquipItemSchema with Zod', () => {
    const valid = EquipItemSchema.safeParse({ itemId: 'item-123' });
    expect(valid.success).toBe(true);

    const invalid = EquipItemSchema.safeParse({ itemId: '' });
    expect(invalid.success).toBe(false);
  });

  it('validates UnequipItemSchema with Zod', () => {
    const validSlot = UnequipItemSchema.safeParse({ slot: 'AVATAR' });
    expect(validSlot.success).toBe(true);

    const validItem = UnequipItemSchema.safeParse({ itemId: 'item-123' });
    expect(validItem.success).toBe(true);

    const invalid = UnequipItemSchema.safeParse({ slot: 'INVALID' });
    expect(invalid.success).toBe(false);
  });

  it('validates InventoryFilterSchema with Zod', () => {
    const valid = InventoryFilterSchema.safeParse({
      category: 'BADGE',
      search: 'Pioneer',
      sortBy: 'NAME',
    });
    expect(valid.success).toBe(true);

    const invalid = InventoryFilterSchema.safeParse({
      sortBy: 'PRICE',
    });
    expect(invalid.success).toBe(false);
  });
});
