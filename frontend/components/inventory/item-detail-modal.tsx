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
  X,
  Loader2,
  Calendar,
  Coins,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InventoryItem, EquipmentSlot, CharacterEquipmentMap } from '@/../src/shared/types/inventory';
import type { ShopItem } from '@/../src/shared/types/economy';
import { EQUIPMENT_SLOT_LABELS } from '@/../src/shared/constants/inventory';
import { CURRENCY_SYMBOL, getRarityBadgeVariant } from '@/features/rewards/reward-engine';

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

export interface ItemDetailModalProps {
  item: InventoryItem | null;
  equipment: CharacterEquipmentMap;
  isOpen: boolean;
  onClose: () => void;
  onEquip: (item: ShopItem) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  actionLoadingId: string | null;
}

export function ItemDetailModal({
  item,
  equipment,
  isOpen,
  onClose,
  onEquip,
  onUnequip,
  actionLoadingId,
}: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const shopItem = item.item;
  const slot = shopItem.category as EquipmentSlot;
  const slotLabel = EQUIPMENT_SLOT_LABELS[slot] || slot;
  const IconComponent = (shopItem.icon && ICON_MAP[shopItem.icon]) || Package;
  const rarityVariant = getRarityBadgeVariant(shopItem.rarity);
  const isActionLoading = actionLoadingId === shopItem.id || actionLoadingId === slot;

  // Check if another item is currently occupying this slot
  const currentlyEquippedInSlot = equipment[slot];
  const willReplaceAnother =
    !item.isEquipped &&
    currentlyEquippedInSlot &&
    currentlyEquippedInSlot.id !== shopItem.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={rarityVariant} size="md">
              {shopItem.rarity || 'COMMON'}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted/60">
              {slotLabel} Slot
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Big Preview Icon Box */}
          <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border/60 bg-muted/20 relative overflow-hidden">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center border shadow-lg mb-3"
              style={
                shopItem.previewColor
                  ? {
                      backgroundColor: `${shopItem.previewColor}25`,
                      borderColor: `${shopItem.previewColor}70`,
                      color: shopItem.previewColor,
                    }
                  : {
                      backgroundColor: 'hsl(var(--primary) / 0.15)',
                      borderColor: 'hsl(var(--primary) / 0.4)',
                      color: 'hsl(var(--primary))',
                    }
              }
            >
              <IconComponent className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-foreground text-center">
              {shopItem.name}
            </h3>

            <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
              {shopItem.description}
            </p>
          </div>

          {/* Status Alert Banner */}
          {item.isEquipped ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Check className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Active Loadout:</span> This item is currently equipped in your <span className="underline font-semibold">{slotLabel}</span> slot.
              </div>
            </div>
          ) : willReplaceAnother ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Slot Replacement:</span> Equipping this will automatically replace{' '}
                <span className="font-semibold underline">{currentlyEquippedInSlot.name}</span> in the {slotLabel} slot. Your previous item will remain safely in your inventory.
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Shield className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Ready to Equip:</span> Your {slotLabel} slot is currently empty.
              </div>
            </div>
          )}

          {/* Item Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                Acquired Price
              </span>
              <span className="font-semibold text-foreground">
                {item.pricePaid} {CURRENCY_SYMBOL}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border/40 bg-muted/10 space-y-1">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Purchased On
              </span>
              <span className="font-semibold text-foreground">
                {new Date(item.purchasedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isActionLoading}>
            Close
          </Button>

          {item.isEquipped ? (
            <Button
              variant="destructive"
              disabled={isActionLoading}
              onClick={() => {
                onUnequip(slot);
                onClose();
              }}
            >
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <X className="w-4 h-4 mr-1.5" />
              )}
              Unequip from {slotLabel}
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={isActionLoading}
              onClick={() => {
                onEquip(shopItem);
                onClose();
              }}
            >
              {isActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Shield className="w-4 h-4 mr-1.5" />
              )}
              {willReplaceAnother ? `Replace & Equip to ${slotLabel}` : `Equip to ${slotLabel}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
