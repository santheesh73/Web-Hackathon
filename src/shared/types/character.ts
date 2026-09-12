export type LifeFocus =
  | 'health'
  | 'learning'
  | 'career'
  | 'finance'
  | 'creativity'
  | 'personal';

export interface AvatarOption {
  id: string;
  name: string;
  archetype: string;
  iconName: string;
  description: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  lifeFocus: LifeFocus;
  xp: number;
  level: number;
  skillPoints: number;
  evolutionTier: number;
  evolutionTitle: string;
  gold: number;
  createdAt: string;
  updatedAt: string;
}
