'use client';

import * as React from 'react';
import {
  User,
  Palette,
  Award,
  Sparkles,
  X,
  Loader2,
  Package,
  Shield,
  Sun,
  Flame,
  Moon,
  Crown,
  Terminal,
  Compass,
  Sword,
  BookOpen,
  EyeOff,
  SunDim,
  MousePointer,
  Sparkle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EquipmentSlot, CharacterEquipmentMap } from '@/../src/shared/types/inventory';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_LABELS } from '@/../src/shared/constants/inventory';
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

const SLOT_DEFAULT_ICONS: Record<EquipmentSlot, React.ComponentType<{ className?: string }>> = {
  AVATAR: User,
  THEME: Palette,
  BADGE: Award,
  COSMETIC: Sparkles,
};

const SLOT_DESCRIPTIONS: Record<EquipmentSlot, string> = {
  AVATAR: 'Archetype Portrait & Identity',
  THEME: 'UI Accent & Atmosphere',
  BADGE: 'Honor Crest & Title Sigil',
  COSMETIC: 'Aura & Visual Flare',
};

export interface EquippedItemsProps {
  equipment: CharacterEquipmentMap;
  onUnequip: (slot: EquipmentSlot) => void;
  actionLoadingId: string | null;
  className?: string;
}

export function EquippedItems({
  equipment,
  onUnequip,
  actionLoadingId,
  className,
}: EquippedItemsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Equipped Gear & Loadout
          </h3>
          <p className="text-xs text-muted-foreground">
            Active visual flair and customization slots. Exactly one item can be equipped per slot.
          </p>
        </div>
        <div className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
          {Object.keys(equipment).length} / 4 Slots Active
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EQUIPMENT_SLOTS.map((slot) => {
          const equippedItem = equipment[slot];
          const SlotDefaultIcon = SLOT_DEFAULT_ICONS[slot];
          const isProcessing = actionLoadingId === slot;

          if (!equippedItem) {
            return (
              <div
                key={slot}
                className="relative rounded-xl border border-dashed border-border/80 bg-background/40 p-4 flex flex-col justify-between items-center text-center transition-all hover:border-border hover:bg-muted/10 min-h-[160px]"
              >
                <div className="w-full flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                    {EQUIPMENT_SLOT_LABELS[slot]}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">EMPTY</span>
                </div>

                <div className="my-3 flex flex-col items-center gap-2">
                  <div className="w-11 h-11 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center text-muted-foreground/50">
                    <SlotDefaultIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    No {EQUIPMENT_SLOT_LABELS[slot]} Equipped
                  </span>
                </div>

                <span className="text-[11px] text-muted-foreground/70">
                  {SLOT_DESCRIPTIONS[slot]}
                </span>
              </div>
            );
          }

          const ItemIcon = (equippedItem.icon && ICON_MAP[equippedItem.icon]) || Package;
          const rarityVariant = getRarityBadgeVariant(equippedItem.rarity);

          return (
            <Card
              key={slot}
              variant="interactive"
              className="relative overflow-hidden p-4 flex flex-col justify-between border-primary/40 bg-gradient-to-b from-primary/5 via-background to-background shadow-md hover:shadow-lg transition-all min-h-[160px]"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-primary">
                  {EQUIPMENT_SLOT_LABELS[slot]}
                </span>
                <Badge variant={rarityVariant} size="sm">
                  {equippedItem.rarity}
                </Badge>
              </div>

              {/* Item Info */}
              <div className="flex items-center gap-3 my-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-primary/30 shadow-inner relative"
                  style={
                    equippedItem.previewColor
                      ? {
                          backgroundColor: `${equippedItem.previewColor}20`,
                          borderColor: `${equippedItem.previewColor}60`,
                          color: equippedItem.previewColor,
                        }
                      : undefined
                  }
                >
                  <ItemIcon className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-foreground truncate" title={equippedItem.name}>
                    {equippedItem.name}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={equippedItem.description}>
                    {equippedItem.description}
                  </p>
                </div>
              </div>

              {/* Unequip Action */}
              <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Equipped
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => onUnequip(slot)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 mr-1" />
                      Unequip
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
