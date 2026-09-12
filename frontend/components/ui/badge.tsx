import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'rpg';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      warning: 'bg-amber-50 text-amber-700 border-amber-200',
      danger: 'bg-rose-50 text-rose-700 border-rose-200',
      info: 'bg-sky-50 text-sky-700 border-sky-200',
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      rpg: 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-700 border-amber-300 font-semibold',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium transition-colors select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
