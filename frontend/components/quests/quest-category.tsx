import * as React from 'react';
import { Heart, Brain, Briefcase, Coins, Palette, Sparkles, LucideIcon } from 'lucide-react';
import type { QuestCategory } from '@/../src/shared/types/quest';
import { cn } from '@/lib/utils';

export const CATEGORY_ICONS: Record<QuestCategory, LucideIcon> = {
  Health: Heart,
  Learning: Brain,
  Career: Briefcase,
  Finance: Coins,
  Creativity: Palette,
  Personal: Sparkles,
};

export const CATEGORY_COLORS: Record<QuestCategory, { badge: string; text: string }> = {
  Health: { badge: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-600' },
  Learning: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-600' },
  Career: { badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-600' },
  Finance: { badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' },
  Creativity: { badge: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-600' },
  Personal: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' },
};

export interface QuestCategoryBadgeProps {
  category: QuestCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuestCategoryBadge({
  category,
  showIcon = true,
  size = 'sm',
  className,
}: QuestCategoryBadgeProps) {
  const Icon = CATEGORY_ICONS[category] || Sparkles;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Personal;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold select-none',
        colors.badge,
        sizeClasses,
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes, 'shrink-0')} />}
      <span>{category}</span>
    </span>
  );
}
