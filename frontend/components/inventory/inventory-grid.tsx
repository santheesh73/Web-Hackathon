'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackageOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { InventoryItem, EquipmentSlot } from '@/../src/shared/types/inventory';
import type { ShopItem } from '@/../src/shared/types/economy';
import { InventoryItemCard } from './inventory-item';

export interface InventoryGridProps {
  items: InventoryItem[];
  loading: boolean;
  onEquip: (item: ShopItem) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onInspect: (item: InventoryItem) => void;
  actionLoadingId: string | null;
  className?: string;
}

export function InventoryGrid({
  items,
  loading,
  onEquip,
  onUnequip,
  onInspect,
  actionLoadingId,
  className,
}: InventoryGridProps) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-5 h-48 animate-pulse flex flex-col justify-between border-border/40 bg-card/40">
            <div className="flex justify-between items-center">
              <div className="w-16 h-5 bg-muted/60 rounded" />
              <div className="w-14 h-4 bg-muted/40 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted/60 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-4 bg-muted/60 rounded" />
                <div className="w-full h-3 bg-muted/40 rounded" />
              </div>
            </div>
            <div className="pt-3 border-t border-border/30 flex justify-between items-center">
              <div className="w-16 h-4 bg-muted/40 rounded" />
              <div className="w-20 h-7 bg-muted/60 rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/30">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 shadow-inner">
          <PackageOpen className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-foreground">No Items in Inventory</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          You don&apos;t have any items matching this filter in your inventory yet. Earn Gold by completing quests, chains, and boss encounters, then acquire gear in the Shop.
        </p>

        <Link href="/shop">
          <Button variant="primary" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Visit the Shop
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4', className)}
    >
      {items.map((invItem) => (
        <motion.div key={invItem.id} variants={fadeInUp}>
          <InventoryItemCard
            item={invItem}
            onEquip={onEquip}
            onUnequip={onUnequip}
            onInspect={onInspect}
            actionLoadingId={actionLoadingId}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
