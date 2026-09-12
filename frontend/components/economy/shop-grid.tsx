'use client';

import * as React from 'react';
import { Search, ShoppingBag, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShopItemCard } from './shop-item-card';
import { cn } from '@/lib/utils';
import type { ShopItemWithOwnership } from '@/../src/shared/types/economy';
import type { ShopCategoryTab } from '@/features/rewards/types';

export interface ShopGridProps {
  items: ShopItemWithOwnership[];
  characterGold: number;
  selectedCategory: ShopCategoryTab;
  onSelectCategory: (cat: ShopCategoryTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectItem: (item: ShopItemWithOwnership) => void;
  loading?: boolean;
}

const CATEGORY_TABS: { key: ShopCategoryTab; label: string }[] = [
  { key: 'ALL', label: 'All Items' },
  { key: 'AVATAR', label: 'Avatars' },
  { key: 'THEME', label: 'Themes' },
  { key: 'BADGE', label: 'Badges' },
  { key: 'COSMETIC', label: 'Cosmetics' },
];

export function ShopGrid({
  items,
  characterGold,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectItem,
  loading = false,
}: ShopGridProps) {
  const ownedCount = items.filter((i) => i.isOwned).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar: Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectCategory(tab.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm font-semibold'
                    : 'bg-surface-muted/60 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Grid Meta Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {items.length} {items.length === 1 ? 'reward' : 'rewards'}
        </span>
        <span>
          {ownedCount} of {items.length} collected
        </span>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              characterGold={characterGold}
              onSelect={onSelectItem}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/80 bg-surface-muted/30">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base text-foreground">No rewards found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchQuery
              ? `No catalog items matched "${searchQuery}". Try a different keyword.`
              : 'There are no items currently available in this category.'}
          </p>
          {(searchQuery || selectedCategory !== 'ALL') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('ALL');
              }}
              className="mt-4 text-xs gap-1.5"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
