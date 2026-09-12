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
  Award,
  Flame,
  SunDim,
  MousePointer,
  Crown,
  Sparkle,
  Package,
  Check,
  Loader2,
  X,
  User,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InventoryItem, EquipmentSlot } from '@/../src/shared/types/inventory';
import type { ShopItem } from '@/../src/shared/types/economy';
import { EQUIPMENT_SLOT_LABELS } from '@/../src/shared/constants/inventory';
import { getRarityBadgeVariant } from '@/features/rewards/reward-engine';

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
  Award,
  Flame,
  SunDim,
  MousePointer,
  Crown,
  Sparkle,
  User,
};

export interface InventoryItemCardProps {
  item: InventoryItem;
  onEquip: (shopItem: ShopItem) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onInspect: (item: InventoryItem) => void;
  actionLoadingId: string | null;
  className?: string;
}

export function InventoryItemCard({
  item,
  onEquip,
  onUnequip,
  onInspect,
  actionLoadingId,
  className,
}: InventoryItemCardProps) {
  const shopItem = item.item;
  const IconComponent = (shopItem.icon && ICON_MAP[shopItem.icon]) || Package;
  const rarityVariant = getRarityBadgeVariant(shopItem.rarity);
  const slot = shopItem.category as EquipmentSlot;
  const slotLabel = EQUIPMENT_SLOT_LABELS[slot] || slot;
  const isActionLoading = actionLoadingId === shopItem.id || actionLoadingId === slot;

  return (
    <Card
      variant={item.isEquipped ? 'interactive' : 'default'}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-200 border',
        item.isEquipped
          ? 'border-emerald-500/50 bg-emerald-950/10 shadow-md ring-1 ring-emerald-500/20'
          : 'border-border/60 hover:border-primary/50 hover:shadow-lg bg-card/80',
        className
      )}
    >
      {/* Top Banner: Rarity & Slot */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Badge variant={rarityVariant} size="sm">
          {shopItem.rarity || 'COMMON'}
        </Badge>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {slotLabel}
        </span>
      </div>

      {/* Item Icon & Description */}
      <div
        className="flex items-center gap-4 my-2 cursor-pointer group"
        onClick={() => onInspect(item)}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-inner',
            item.isEquipped
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-primary/10 border-primary/20 text-primary'
          )}
          style={
            shopItem.previewColor
              ? {
                  backgroundColor: `${shopItem.previewColor}18`,
                  borderColor: `${shopItem.previewColor}45`,
                  color: shopItem.previewColor,
                }
              : undefined
          }
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors"
              title={shopItem.name}
            >
              {shopItem.name}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5" title={shopItem.description}>
            {shopItem.description}
          </p>
        </div>
      </div>

      {/* Footer: Equipped State & Actions */}
      <div className="pt-4 mt-2 border-t border-border/50 flex items-center justify-between gap-2">
        {item.isEquipped ? (
          <>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Equipped
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onInspect(item)}
              >
                <Info className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isActionLoading}
                onClick={() => onUnequip(slot)}
                className="h-8 px-3 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 border border-border/40"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Unequip
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              In Bag
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onInspect(item)}
              >
                <Info className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={isActionLoading}
                onClick={() => onEquip(shopItem)}
                className="h-8 px-4 text-xs font-semibold"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                )}
                Equip
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
