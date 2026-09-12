'use client';

import * as React from 'react';
import { Search, SlidersHorizontal, Trophy, CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  AchievementStatusFilter,
  AchievementCategoryFilter,
  AchievementSortOption,
} from '@/features/achievements/types';
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_LABELS,
} from '@/../src/shared/constants/achievements';
import type { AchievementsSummary } from '@/../src/shared/types/achievement';

export interface AchievementFiltersProps {
  selectedStatus: AchievementStatusFilter;
  onSelectStatus: (status: AchievementStatusFilter) => void;
  selectedCategory: AchievementCategoryFilter;
  onSelectCategory: (category: AchievementCategoryFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: AchievementSortOption;
  onSortChange: (sort: AchievementSortOption) => void;
  summary: AchievementsSummary;
  className?: string;
}

export function AchievementFilters({
  selectedStatus,
  onSelectStatus,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  summary,
  className,
}: AchievementFiltersProps) {
  const STATUS_TABS: Array<{
    id: AchievementStatusFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
  }> = [
    { id: 'ALL', label: 'All', icon: Trophy, count: summary.total },
    { id: 'UNLOCKED', label: 'Unlocked', icon: CheckCircle2, count: summary.unlockedCount },
    { id: 'IN_PROGRESS', label: 'In Progress', icon: Clock, count: summary.inProgressCount },
    { id: 'LOCKED', label: 'Locked', icon: Lock, count: summary.lockedCount },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedStatus === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-full',
                  isActive ? 'bg-black/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category Dropdown, Search Input, and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search achievements by name or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background/60 border border-border/70 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns for Category and Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value as AchievementCategoryFilter)}
            className="bg-background/80 border border-border/70 rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {ACHIEVEMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {ACHIEVEMENT_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as AchievementSortOption)}
              className="bg-background/80 border border-border/70 rounded-lg px-2.5 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer"
            >
              <option value="RECENT">Recently Unlocked</option>
              <option value="PROGRESS">Highest Progress</option>
              <option value="NAME">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
