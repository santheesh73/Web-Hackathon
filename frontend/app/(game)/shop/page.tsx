'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Sparkles,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Coins,
} from 'lucide-react';
import { useCharacter } from '@/hooks/use-character';
import { useShop } from '@/features/rewards/use-shop';
import { CurrencyDisplay } from '@/components/economy/currency-display';
import { ShopGrid } from '@/components/economy/shop-grid';
import { PurchaseModal } from '@/components/economy/purchase-modal';
import { TransactionHistory } from '@/components/economy/transaction-history';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ShopItemWithOwnership } from '@/../src/shared/types/economy';
import { CURRENCY_SYMBOL } from '@/../src/shared/constants/economy';

export default function ShopPage() {
  const { character } = useCharacter();
  const {
    items,
    allItems,
    transactions,
    summary,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    purchaseItem,
  } = useShop();

  const [activeTab, setActiveTab] = React.useState<'CATALOG' | 'LEDGER'>('CATALOG');
  const [selectedItem, setSelectedItem] = React.useState<ShopItemWithOwnership | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [lastPurchasedItem, setLastPurchasedItem] = React.useState<string | null>(null);

  const handleSelectItem = (item: ShopItemWithOwnership) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmPurchase = async (item: ShopItemWithOwnership) => {
    const res = await purchaseItem(item);
    if (res.success) {
      setLastPurchasedItem(item.name);
      setTimeout(() => {
        setLastPurchasedItem(null);
      }, 5000);
    } else {
      throw new Error(res.error || 'Failed to complete purchase');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Reward Marketplace
              </h1>
              <p className="text-xs text-muted-foreground">
                Convert your real-life productivity into permanent RPG upgrades and cosmetics.
              </p>
            </div>
          </div>
        </div>

        {/* Live Currency Display in Header */}
        <div className="flex items-center gap-3">
          <CurrencyDisplay amount={character?.gold ?? 0} size="lg" />
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {lastPurchasedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>
                <strong>Purchase Successful!</strong> You unlocked <strong>{lastPurchasedItem}</strong>.
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLastPurchasedItem(null)}
              className="text-xs h-7 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Economy Metrics Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card className="p-4 space-y-1 bg-surface-muted/30">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Available Balance
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-amber-500">
              {CURRENCY_SYMBOL} {(character?.gold ?? 0).toLocaleString()}
            </span>
            <Coins className="w-4 h-4 text-amber-500/60" />
          </div>
        </Card>

        {/* Total Earned */}
        <Card className="p-4 space-y-1 bg-surface-muted/30">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Earned
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-600">
              +{CURRENCY_SYMBOL} {summary.totalEarned.toLocaleString()}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500/60" />
          </div>
        </Card>

        {/* Total Spent */}
        <Card className="p-4 space-y-1 bg-surface-muted/30">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Spent
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-rose-500">
              -{CURRENCY_SYMBOL} {summary.totalSpent.toLocaleString()}
            </span>
            <ShoppingBag className="w-4 h-4 text-rose-500/60" />
          </div>
        </Card>

        {/* Items Collected */}
        <Card className="p-4 space-y-1 bg-surface-muted/30">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rewards Collected
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-foreground">
              {summary.ownedItemsCount} / {allItems.length}
            </span>
            <Sparkles className="w-4 h-4 text-primary/60" />
          </div>
        </Card>
      </div>

      {/* Main View Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('CATALOG')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-1 transition-colors',
            activeTab === 'CATALOG'
              ? 'border-amber-500 text-amber-500 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Reward Catalog</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted border text-muted-foreground">
            {allItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LEDGER')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-1 transition-colors',
            activeTab === 'LEDGER'
              ? 'border-amber-500 text-amber-500 font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Receipt className="w-4 h-4" />
          <span>Economy Ledger</span>
          {transactions.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted border text-muted-foreground">
              {transactions.length}
            </span>
          )}
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'CATALOG' ? (
        <ShopGrid
          items={items}
          characterGold={character?.gold ?? 0}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectItem={handleSelectItem}
          loading={loading}
        />
      ) : (
        <TransactionHistory transactions={transactions} loading={loading} />
      )}

      {/* Purchase Confirmation Modal */}
      <PurchaseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={selectedItem}
        characterGold={character?.gold ?? 0}
        onConfirm={handleConfirmPurchase}
      />
    </div>
  );
}
