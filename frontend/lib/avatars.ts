export interface AvatarOption {
  id: string;
  name: string;
  archetype: string;
  iconName: 'Shield' | 'BookOpen' | 'Compass' | 'Hammer' | 'FlaskConical' | 'Sparkles';
  description: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'warrior',
    name: 'The Vanguard',
    archetype: 'Warrior',
    iconName: 'Shield',
    description: 'Disciplined and relentless in overcoming daily physical and mental obstacles.',
    color: 'from-amber-500 to-red-500',
  },
  {
    id: 'scholar',
    name: 'The Arcanist',
    archetype: 'Scholar',
    iconName: 'BookOpen',
    description: 'Curious seeker of knowledge, deep focus, and continuous skill mastery.',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    id: 'scout',
    name: 'The Ranger',
    archetype: 'Scout',
    iconName: 'Compass',
    description: 'Adaptable explorer navigating new territories, habits, and opportunities.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'builder',
    name: 'The Artificer',
    archetype: 'Builder',
    iconName: 'Hammer',
    description: 'Systematic creator crafting robust tools, code, and long-lasting achievements.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 'alchemist',
    name: 'The Alchemist',
    archetype: 'Strategist',
    iconName: 'FlaskConical',
    description: 'Calculated experimenter optimizing habits, nutrition, and energy levels.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'sentinel',
    name: 'The Guardian',
    archetype: 'Protector',
    iconName: 'Sparkles',
    description: 'Resilient and steady foundation maintaining consistency and long streaks.',
    color: 'from-rose-500 to-pink-600',
  },
];
