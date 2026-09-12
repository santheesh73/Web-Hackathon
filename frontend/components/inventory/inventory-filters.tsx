'use client';

import * as React from 'react';
import { Search, SlidersHorizontal, User, Palette, Award, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EquipmentSlot } from '@/../src/shared/types/inventory';
import type { InventoryFilterTab, InventorySortOption } from '@/features/inventory/types';

export interface InventoryFiltersProps {
  selectedFilter: InventoryFilterTab;
  onSelectFilter: (filter: InventoryFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: InventorySortOption;
  onSortChange: (sort: InventorySortOption) => void;
  counts: {
    totalOwned: number;
    equippedCount: number;
    categoryCounts: Record<EquipmentSlot, number>;
  };
  className?: string;
}

const FILTER_TABS: Array<{
  id: InventoryFilterTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'ALL', label: 'All Items', icon: LayoutGrid },
  { id: 'AVATAR', label: 'Avatars', icon: User },
  { id: 'THEME', label: 'Themes', icon: Palette },
  { id: 'BADGE', label: 'Badges', icon: Award },
  { id: 'COSMETIC', label: 'Cosmetics', icon: Sparkles },
];

export function InventoryFilters({
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
  className,
}: InventoryFiltersProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedFilter === tab.id;
          const count =
            tab.id === 'ALL'
              ? counts.totalOwned
              : counts.categoryCounts[tab.id as EquipmentSlot] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
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
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your inventory by name or description..."
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as InventorySortOption)}
            className="bg-background/80 border border-border/70 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all cursor-pointer"
          >
            <option value="RECENT">Recently Acquired</option>
            <option value="NAME">Name (A-Z)</option>
            <option value="CATEGORY">Slot / Category</option>
          </select>
        </div>
      </div>
    </div>
  );
}
