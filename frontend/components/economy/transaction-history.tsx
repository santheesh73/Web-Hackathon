'use client';

import * as React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Sparkles,
  ShoppingBag,
  Trophy,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EconomyTransaction, EconomyTransactionType } from '@/../src/shared/types/economy';
import { CURRENCY_SYMBOL } from '@/../src/shared/constants/economy';

export interface TransactionHistoryProps {
  transactions: EconomyTransaction[];
  loading?: boolean;
  className?: string;
}

export function TransactionHistory({
  transactions,
  loading = false,
  className,
}: TransactionHistoryProps) {
  const [filter, setFilter] = React.useState<'ALL' | 'EARN' | 'SPEND'>('ALL');

  const filtered = React.useMemo(() => {
    if (filter === 'ALL') return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const totalEarned = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === 'EARN')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalSpent = React.useMemo(() => {
    return transactions
      .filter((t) => t.type === 'SPEND')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getSourceIcon = (source: string, type: EconomyTransactionType) => {
    if (type === 'SPEND') return ShoppingBag;
    switch (source) {
      case 'BOSS_COMPLETION':
        return Trophy;
      case 'CHAIN_COMPLETION':
        return Flame;
      case 'QUEST_COMPLETION':
      default:
        return CheckCircle2;
    }
  };

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Ledger Header and Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-lg text-foreground">Economy Ledger</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable server-authoritative audit record of every Gold coin earned and spent.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-medium">
            + {CURRENCY_SYMBOL} {totalEarned.toLocaleString()} Earned
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 font-medium">
            - {CURRENCY_SYMBOL} {totalSpent.toLocaleString()} Spent
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['ALL', 'EARN', 'SPEND'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
              filter === f
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-surface-muted/60 text-muted-foreground hover:bg-surface-muted hover:text-foreground'
            )}
          >
            {f === 'ALL' ? 'All Activity' : f === 'EARN' ? 'Earned' : 'Spent'}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-border/40">
          {filtered.map((tx) => {
            const isEarn = tx.type === 'EARN';
            const Icon = getSourceIcon(tx.source, tx.type);
            const dateFormatted = new Date(tx.createdAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-surface-muted/30 px-2 rounded-lg"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border',
                      isEarn
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description || tx.source.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{dateFormatted}</p>
                  </div>
                </div>

                {/* Right: Amount & Balance After */}
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-sm font-bold flex items-center justify-end gap-1',
                      isEarn ? 'text-emerald-600' : 'text-rose-600'
                    )}
                  >
                    {isEarn ? (
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isEarn ? '+' : '-'} {CURRENCY_SYMBOL} {tx.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Balance: {CURRENCY_SYMBOL} {tx.balanceAfter.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Receipt className="w-8 h-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">No transactions recorded</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Complete quests and chains to earn Gold, then visit the Shop to unlock permanent rewards.
          </p>
        </div>
      )}
    </Card>
  );
}
