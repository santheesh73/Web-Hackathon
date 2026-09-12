'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useCharacter } from '@/hooks/use-character';
import { useInventory } from '@/features/inventory/use-inventory';
import { EquippedItems } from '@/components/inventory/equipped-items';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { InventoryGrid } from '@/components/inventory/inventory-grid';
import { ItemDetailModal } from '@/components/inventory/item-detail-modal';
import { CurrencyDisplay } from '@/components/economy/currency-display';
import { Button } from '@/components/ui/button';
import type { InventoryItem, EquipmentSlot } from '@/../src/shared/types/inventory';
import type { ShopItem } from '@/../src/shared/types/economy';

export default function InventoryPage() {
  const { character } = useCharacter();
  const {
    items,
    equipment,
    loading,
    actionLoadingId,
    error,
    selectedFilter,
    setSelectedFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    equipItem,
    unequipSlot,
    stats,
  } = useInventory();

  const [inspectingItem, setInspectingItem] = React.useState<InventoryItem | null>(null);
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleEquip = async (shopItem: ShopItem) => {
    const res = await equipItem(shopItem);
    if (res.success && res.equipped) {
      const replacedNotice = res.replacedItemId ? ' (replaced previous gear)' : '';
      showNotification(
        'success',
        `Equipped ${res.equipped.name} to ${res.equipped.slot} slot!${replacedNotice}`
      );
    } else {
      showNotification('error', res.error || 'Failed to equip item.');
    }
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    const res = await unequipSlot(slot);
    if (res.success && res.unequipped) {
      showNotification(
        'success',
        `Unequipped ${res.unequipped.name} from ${res.unequipped.slot} slot.`
      );
    } else {
      showNotification('error', res.error || 'Failed to unequip slot.');
    }
  };

  const handleInspect = (item: InventoryItem) => {
    setInspectingItem(item);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Inventory & Equipment
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your acquired items, customize your active loadout slots, and express your RPG style.
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Shop CTA */}
        <div className="flex items-center gap-3">
          <CurrencyDisplay amount={character?.gold ?? 0} size="md" />
          <Link href="/shop">
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              Visit Shop
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Toast Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center justify-between p-4 rounded-xl text-sm shadow-sm border ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 font-semibold uppercase tracking-wider"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section: Active Equipment Loadout (Paper Doll) */}
      <EquippedItems
        equipment={equipment}
        onUnequip={handleUnequip}
        actionLoadingId={actionLoadingId}
      />

      {/* Filter and Search Bar */}
      <div className="pt-2">
        <InventoryFilters
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          counts={stats}
        />
      </div>

      {/* Inventory Items Grid */}
      <InventoryGrid
        items={items}
        loading={loading}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        onInspect={handleInspect}
        actionLoadingId={actionLoadingId}
      />

      {/* Item Detail & Equip Modal */}
      <ItemDetailModal
        item={inspectingItem}
        equipment={equipment}
        isOpen={Boolean(inspectingItem)}
        onClose={() => setInspectingItem(null)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}
