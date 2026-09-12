'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'primary' | 'accent' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = 'primary',
      size = 'md',
      showValue = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

    const barVariants = {
      primary: 'bg-primary',
      accent: 'bg-gradient-to-r from-amber-500 to-amber-600',
      success: 'bg-emerald-500',
      danger: 'bg-rose-500',
    };

    const heights = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };

    return (
      <div ref={ref} className={cn('w-full space-y-1.5', className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            {label && <span>{label}</span>}
            {showValue && (
              <span className="font-semibold text-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
          className={cn(
            'w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/60 relative',
            heights[size]
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={cn('h-full rounded-full transition-all', barVariants[variant])}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';
