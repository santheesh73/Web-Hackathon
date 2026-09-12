import type { EquipmentSlot } from '../types/inventory';

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'AVATAR',
  'THEME',
  'BADGE',
  'COSMETIC',
];

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  AVATAR: 'Avatar Archetype',
  THEME: 'Visual Theme',
  BADGE: 'Displayed Badge',
  COSMETIC: 'Cosmetic Flair',
};

export const EQUIPMENT_SLOT_DESCRIPTIONS: Record<EquipmentSlot, string> = {
  AVATAR: 'Customizes your adventurer portrait across the dashboard and profile.',
  THEME: 'Applies personalized accent coloring and ambient visual theme.',
  BADGE: 'Showcases your most distinguished achievement emblem on your profile.',
  COSMETIC: 'Envelops your character portrait in an animated particle aura.',
};

export const EQUIPMENT_SLOT_ICONS: Record<EquipmentSlot, string> = {
  AVATAR: 'User',
  THEME: 'Palette',
  BADGE: 'Award',
  COSMETIC: 'Sparkles',
};

export function isValidEquipmentSlot(slot: string): slot is EquipmentSlot {
  return EQUIPMENT_SLOTS.includes(slot as EquipmentSlot);
}

export function getEquipmentSlotLabel(slot: EquipmentSlot): string {
  return EQUIPMENT_SLOT_LABELS[slot] || slot;
}
