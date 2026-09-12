import {
  LayoutDashboard,
  Swords,
  User,
  GitFork,
  Link,
  Flame,
  History,
  Store,
  Backpack,
  Trophy,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'default' | 'accent' | 'success';
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    group: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Quests', href: '/quests', icon: Swords },
      { name: 'Character', href: '/character', icon: User },
      { name: 'Skill Tree', href: '/skill-tree', icon: GitFork },
    ],
  },
  {
    group: 'PROGRESSION',
    items: [
      { name: 'Quest Chains', href: '/quests/chains', icon: Link },
      { name: 'Boss Quests', href: '/boss-quests', icon: Flame },
      { name: 'Achievements', href: '/achievements', icon: Trophy },
      { name: 'History', href: '/history', icon: History },
    ],
  },
  {
    group: 'REWARDS',
    items: [
      { name: 'Shop', href: '/shop', icon: Store },
      { name: 'Inventory', href: '/inventory', icon: Backpack },
    ],
  },
];
