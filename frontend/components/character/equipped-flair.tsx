'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Shield,
  Palette,
  Award,
  Sparkles,
  ArrowRight,
  User,
  Package,
  ExternalLink,
  Flame,
  Sun,
  Crown,
  Terminal,
  Sword,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CharacterEquipmentMap, EquipmentSlot } from '@/../src/shared/types/inventory';
import { EQUIPMENT_SLOTS, EQUIPMENT_SLOT_LABELS } from '@/../src/shared/constants/inventory';
import { getRarityBadgeVariant } from '@/features/rewards/reward-engine';

const SLOT_ICONS: Record<EquipmentSlot, React.ComponentType<{ className?: string }>> = {
  AVATAR: User,
  THEME: Palette,
  BADGE: Award,
  COSMETIC: Sparkles,
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Palette,
  Award,
  Sparkles,
  Flame,
  Sun,
  Crown,
  Terminal,
  Sword,
  BookOpen,
  Shield,
};

export interface EquippedFlairProps {
  equipment: CharacterEquipmentMap;
  className?: string;
}

export function EquippedFlair({ equipment, className }: EquippedFlairProps) {
  return (
    <Card variant="default" className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Equipped Loadout & Cosmetic Flair
            </CardTitle>
            <CardDescription className="text-xs">
              Express your unique identity with equipped avatars, UI themes, achievement badges, and auras.
            </CardDescription>
          </div>
          <Link href="/inventory">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
              Manage Loadout
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EQUIPMENT_SLOTS.map((slot) => {
            const item = equipment[slot];
            const DefaultSlotIcon = SLOT_ICONS[slot];
            const ItemIcon = (item?.icon && ICON_MAP[item.icon]) || DefaultSlotIcon;
            const rarityVariant = item ? getRarityBadgeVariant(item.rarity) : 'neutral';

            return (
              <div
                key={slot}
                className={cn(
                  'p-3 rounded-xl border flex items-center gap-3 transition-all',
                  item
                    ? 'border-border/80 bg-muted/20 hover:border-primary/40'
                    : 'border-dashed border-border/50 bg-background/50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border shadow-inner',
                    item
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-muted/20 border-border/40 text-muted-foreground/40'
                  )}
                  style={
                    item?.previewColor
                      ? {
                          backgroundColor: `${item.previewColor}18`,
                          borderColor: `${item.previewColor}50`,
                          color: item.previewColor,
                        }
                      : undefined
                  }
                >
                  <ItemIcon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {EQUIPMENT_SLOT_LABELS[slot]}
                    </span>
                    {item && (
                      <Badge variant={rarityVariant} size="sm" className="text-[9px] px-1 py-0">
                        {item.rarity}
                      </Badge>
                    )}
                  </div>
                  <h5 className="font-semibold text-xs text-foreground truncate mt-0.5">
                    {item ? item.name : 'Default'}
                  </h5>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item ? item.description : 'No cosmetic equipped'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
