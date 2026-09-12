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
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ShopItemWithOwnership } from '@/../src/shared/types/economy';
import {
  CURRENCY_SYMBOL,
  getRarityBadgeVariant,
  getCategoryLabel,
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

export interface PurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ShopItemWithOwnership | null;
  characterGold: number;
  onConfirm: (item: ShopItemWithOwnership) => Promise<void>;
  loading?: boolean;
}

export function PurchaseModal({
  open,
  onOpenChange,
  item,
  characterGold,
  onConfirm,
  loading = false,
}: PurchaseModalProps) {
  const [submitting, setSubmitting] = React.useState(false);
  const [purchaseError, setPurchaseError] = React.useState<string | null>(null);

  if (!item) return null;

  const IconComponent = (item.icon && ICON_MAP[item.icon]) || Package;
  const balanceAfter = characterGold - item.price;
  const canAfford = balanceAfter >= 0;

  const handleConfirm = async () => {
    if (!canAfford || submitting) return;
    setSubmitting(true);
    setPurchaseError(null);
    try {
      await onConfirm(item);
      onOpenChange(false);
    } catch (err: any) {
      setPurchaseError(err?.message || 'Transaction failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Shop Purchase"
      description="Spend your earned Gold to unlock this permanent productivity reward."
      className="max-w-md"
    >
      <div className="space-y-4 pt-2">
        {/* Item Overview Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/80 bg-surface-muted/50">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
            style={
              item.previewColor
                ? {
                    backgroundColor: `${item.previewColor}15`,
                    borderColor: `${item.previewColor}40`,
                    color: item.previewColor,
                  }
                : undefined
            }
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
              <Badge variant={getRarityBadgeVariant(item.rarity)} size="sm">
                {item.rarity || 'COMMON'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{getCategoryLabel(item.category)}</p>
          </div>
        </div>

        {/* Balance Breakdown */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-surface space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Current Balance</span>
            <span className="font-medium text-foreground">
              {CURRENCY_SYMBOL} {characterGold.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-rose-500 font-medium">
            <span>Item Price</span>
            <span>- {CURRENCY_SYMBOL} {item.price.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between font-semibold">
            <span className="text-foreground">Balance After</span>
            <span
              className={cn(
                'flex items-center gap-1',
                canAfford ? 'text-amber-500' : 'text-rose-500'
              )}
            >
              {CURRENCY_SYMBOL} {Math.max(0, balanceAfter).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Insufficient Funds Warning */}
        {!canAfford && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              You do not have enough Gold for this item. Complete quests or conquer bosses to earn
              more Gold!
            </span>
          </div>
        )}

        {/* Error Feedback */}
        {purchaseError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{purchaseError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting || loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!canAfford || submitting || loading}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium gap-1.5 shadow-sm min-w-[130px]"
          >
            {submitting || loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Purchasing...
              </>
            ) : (
              <>
                <span>Confirm Buy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
