'use client';

import * as React from 'react';
import {
  Sword,
  BookOpen,
  EyeOff,
  Sun,
  Palette,
  Terminal,
  Moon,
  Sparkles,
  Compass,
  Shield,
  Trophy,
  Flame,
  SunDim,
  MousePointer,
  Crown,
  Sparkle,
  Package,
  Check,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShopItemWithOwnership } from '@/../src/shared/types/economy';
import {
  CURRENCY_SYMBOL,
  getRarityBadgeVariant,
  getCategoryLabel,
  canAffordItem,
  calculateShortfall,
} from '@/features/rewards/reward-engine';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sword,
  BookOpen,
  EyeOff,
  Sun,
  Palette,
  Terminal,
  Moon,
  Sparkles,
  Compass,
  Shield,
  Trophy,
  Flame,
  SunDim,
  MousePointer,
  Crown,
  Sparkle,
};

export interface ShopItemCardProps {
  item: ShopItemWithOwnership;
  characterGold: number;
  onSelect: (item: ShopItemWithOwnership) => void;
  className?: string;
}

export function ShopItemCard({
  item,
  characterGold,
  onSelect,
  className,
}: ShopItemCardProps) {
  const IconComponent = (item.icon && ICON_MAP[item.icon]) || Package;
  const affordable = canAffordItem(characterGold, item.price);
  const shortfall = calculateShortfall(characterGold, item.price);
  const rarityVariant = getRarityBadgeVariant(item.rarity);

  return (
    <Card
      variant={item.isOwned ? 'muted' : 'interactive'}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-200 border',
        item.isOwned
          ? 'opacity-85 border-emerald-500/20 bg-emerald-950/5'
          : affordable
          ? 'hover:border-amber-500/50 hover:shadow-lg'
          : 'border-border/60 hover:border-border',
        className
      )}
    >
      {/* Top Banner: Category & Rarity */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant={rarityVariant} size="sm">
          {item.rarity || 'COMMON'}
        </Badge>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {getCategoryLabel(item.category)}
        </span>
      </div>

      {/* Item Icon & Visual Anchor */}
      <div className="flex items-center gap-4 my-2">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform shadow-inner',
            item.isOwned
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
              : 'bg-primary/10 border-primary/20 text-primary'
          )}
          style={
            item.previewColor && !item.isOwned
              ? { backgroundColor: `${item.previewColor}15`, borderColor: `${item.previewColor}40`, color: item.previewColor }
              : undefined
          }
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-base text-foreground truncate" title={item.name}>
            {item.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5" title={item.description}>
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer: Price and Action Button */}
      <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between gap-3">
        {/* Price Tag */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Price
          </span>
          <span
            className={cn(
              'font-bold text-sm flex items-center gap-1',
              item.isOwned
                ? 'text-muted-foreground line-through'
                : affordable
                ? 'text-amber-500'
                : 'text-rose-500'
            )}
          >
            {CURRENCY_SYMBOL} {item.price.toLocaleString()}
          </span>
        </div>

        {/* Action Button */}
        {item.isOwned ? (
          <Button
            size="sm"
            variant="ghost"
            disabled
            className="text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/10 cursor-default gap-1.5 font-medium"
          >
            <Check className="w-3.5 h-3.5" />
            Owned
          </Button>
        ) : affordable ? (
          <Button
            size="sm"
            onClick={() => onSelect(item)}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm gap-1.5"
          >
            Buy Item
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled
            className="text-xs text-muted-foreground border-dashed gap-1 cursor-not-allowed opacity-75"
            title={`Need ${shortfall} more Gold to purchase`}
          >
            <Lock className="w-3 h-3 text-rose-400" />
            Need +{shortfall}
          </Button>
        )}
      </div>
    </Card>
  );
}
