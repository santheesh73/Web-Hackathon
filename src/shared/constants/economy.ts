import type { ItemCategory, ItemRarity, ShopItem } from '../types/economy';

export const CURRENCY_NAME = 'GOLD' as const;
export const CURRENCY_SYMBOL = '◆' as const;

export const DIFFICULTY_GOLD_MAP: Record<string, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 25,
  EASY: 5,
  MEDIUM: 10,
  HARD: 25,
};

export const CHAIN_COMPLETION_GOLD = 50;

export const BOSS_DIFFICULTY_GOLD_MAP: Record<string, number> = {
  Rare: 50,
  Epic: 100,
  Legendary: 250,
  RARE: 50,
  EPIC: 100,
  LEGENDARY: 250,
};

export const ITEM_CATEGORIES: ItemCategory[] = [
  'AVATAR',
  'THEME',
  'BADGE',
  'COSMETIC',
];

export function getGoldForDifficulty(difficulty: string): number {
  return DIFFICULTY_GOLD_MAP[difficulty] ?? 5;
}

export function getGoldForBossDifficulty(difficulty: string): number {
  return BOSS_DIFFICULTY_GOLD_MAP[difficulty] ?? 50;
}

export function formatGold(amount: number): string {
  return `${CURRENCY_SYMBOL} ${amount.toLocaleString()} ${CURRENCY_NAME}`;
}

export interface SeedShopItemData {
  id: string;
  key: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  icon?: string;
  previewColor?: string;
  rarity: ItemRarity;
  metadata?: Record<string, unknown>;
  isActive: boolean;
}

export const SEED_SHOP_ITEMS: SeedShopItemData[] = [
  // AVATARS
  {
    id: '11111111-1111-4111-8111-000000000001',
    key: 'avatar-cyber-samurai',
    name: 'Cyber Samurai',
    description: 'High-tech katana wielder dedicated to precision focus and disciplined execution.',
    category: 'AVATAR',
    price: 100,
    icon: 'Sword',
    previewColor: '#00F0FF',
    rarity: 'EPIC',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000002',
    key: 'avatar-mystic-scholar',
    name: 'Mystic Scholar',
    description: 'Keeper of ancient archives who converts deep study into raw intellectual power.',
    category: 'AVATAR',
    price: 75,
    icon: 'BookOpen',
    previewColor: '#A855F7',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000003',
    key: 'avatar-shadow-rogue',
    name: 'Shadow Rogue',
    description: 'Silent operative who navigates distractions and strikes down deadlines unobserved.',
    category: 'AVATAR',
    price: 120,
    icon: 'EyeOff',
    previewColor: '#64748B',
    rarity: 'EPIC',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000004',
    key: 'avatar-solar-paladin',
    name: 'Solar Paladin',
    description: 'Radiant champion armored in solar vigor, driving forward wellness and daily strength.',
    category: 'AVATAR',
    price: 150,
    icon: 'Sun',
    previewColor: '#FFD700',
    rarity: 'LEGENDARY',
    isActive: true,
  },

  // THEMES
  {
    id: '11111111-1111-4111-8111-000000000005',
    key: 'theme-obsidian-gold',
    name: 'Obsidian & Gold',
    description: 'Deep matte dark backdrop accented with opulent metallic gold highlights.',
    category: 'THEME',
    price: 80,
    icon: 'Palette',
    previewColor: '#D4AF37',
    rarity: 'EPIC',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000006',
    key: 'theme-neon-matrix',
    name: 'Neon Matrix',
    description: 'High-contrast cyberpunk emerald glow on midnight black terminal surfaces.',
    category: 'THEME',
    price: 60,
    icon: 'Terminal',
    previewColor: '#10B981',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000007',
    key: 'theme-cyber-dusk',
    name: 'Cyber Dusk',
    description: 'Synthwave gradient blending deep purple shadows into vibrant magenta radiance.',
    category: 'THEME',
    price: 90,
    icon: 'Moon',
    previewColor: '#EC4899',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000008',
    key: 'theme-aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Mystical polar auroras dancing across glassmorphism surfaces.',
    category: 'THEME',
    price: 120,
    icon: 'Sparkles',
    previewColor: '#06B6D4',
    rarity: 'LEGENDARY',
    isActive: true,
  },

  // BADGES
  {
    id: '11111111-1111-4111-8111-000000000009',
    key: 'badge-early-adopter',
    name: 'Pioneer Sigil',
    description: 'Honors early system explorers who forged path through Phase 1 of LIFE RPG.',
    category: 'BADGE',
    price: 30,
    icon: 'Compass',
    previewColor: '#3B82F6',
    rarity: 'COMMON',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000010',
    key: 'badge-discipline-master',
    name: 'Iron Will Insignia',
    description: 'Awarded to masters of unwavering consistency and relentless task execution.',
    category: 'BADGE',
    price: 60,
    icon: 'Shield',
    previewColor: '#F59E0B',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000011',
    key: 'badge-boss-slayer',
    name: 'Titan Hunter Crest',
    description: 'Emblem of conquering gargantuan milestone challenges and project bosses.',
    category: 'BADGE',
    price: 100,
    icon: 'Trophy',
    previewColor: '#EF4444',
    rarity: 'EPIC',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000012',
    key: 'badge-zen-master',
    name: 'Zen Master Seal',
    description: 'Reflects perfect equilibrium across physical, mental, and creative realms.',
    category: 'BADGE',
    price: 150,
    icon: 'Flame',
    previewColor: '#8B5CF6',
    rarity: 'LEGENDARY',
    isActive: true,
  },

  // COSMETICS
  {
    id: '11111111-1111-4111-8111-000000000013',
    key: 'cosmetic-golden-aura',
    name: 'Golden Aura',
    description: 'Envelops your profile avatar in a gentle, pulsing golden particle shimmer.',
    category: 'COSMETIC',
    price: 80,
    icon: 'SunDim',
    previewColor: '#EAB308',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000014',
    key: 'cosmetic-arcane-trail',
    name: 'Arcane Cursor Trail',
    description: 'Leaves sparkling cyan and violet stardust particles in the wake of interaction.',
    category: 'COSMETIC',
    price: 95,
    icon: 'MousePointer',
    previewColor: '#38BDF8',
    rarity: 'RARE',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000015',
    key: 'cosmetic-void-crown',
    name: 'Void Particle Crown',
    description: 'Crown of dark celestial stars floating above your character portrait.',
    category: 'COSMETIC',
    price: 130,
    icon: 'Crown',
    previewColor: '#C084FC',
    rarity: 'EPIC',
    isActive: true,
  },
  {
    id: '11111111-1111-4111-8111-000000000016',
    key: 'cosmetic-phoenix-banner',
    name: 'Phoenix Embers Banner',
    description: 'Animated background banner with embers rising endlessly from rebirth.',
    category: 'COSMETIC',
    price: 200,
    icon: 'Sparkle',
    previewColor: '#F97316',
    rarity: 'LEGENDARY',
    isActive: true,
  },
];
