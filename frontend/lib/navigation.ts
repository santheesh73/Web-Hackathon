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
      { name: 'Quests', href: '/quests', icon: Swords, badge: '3 Active', badgeVariant: 'accent' },
      { name: 'Character', href: '/character', icon: User },
      { name: 'Skill Tree', href: '/skill-tree', icon: GitFork },
    ],
  },
  {
    group: 'PROGRESSION',
    items: [
      { name: 'Quest Chains', href: '/quest-chains', icon: Link },
      { name: 'Boss Quests', href: '/boss-quests', icon: Flame, badge: '1 Alert', badgeVariant: 'default' },
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
