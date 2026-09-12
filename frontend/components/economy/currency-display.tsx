'use client';

import * as React from 'react';
import { Coins, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCY_NAME, CURRENCY_SYMBOL } from '@/../src/shared/constants/economy';

export interface CurrencyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function CurrencyDisplay({
  amount,
  size = 'md',
  showLabel = true,
  className,
}: CurrencyDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all shadow-sm',
        'bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-500/10',
        'border border-amber-500/30 text-amber-600 dark:text-amber-400',
        sizeClasses[size],
        className
      )}
      title={`${amount.toLocaleString()} ${CURRENCY_NAME}`}
    >
      <div className="relative flex items-center justify-center">
        <Coins className={cn('text-amber-500 animate-pulse', iconSizes[size])} />
        <Sparkles className="w-2.5 h-2.5 text-yellow-300 absolute -top-1 -right-1 opacity-80" />
      </div>
      <span className="font-semibold tracking-tight text-foreground">
        {CURRENCY_SYMBOL} {amount.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider opacity-80">
          {CURRENCY_NAME}
        </span>
      )}
    </div>
  );
}
