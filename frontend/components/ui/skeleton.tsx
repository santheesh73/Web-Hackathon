import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
  const roundings = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200/80 dark:bg-slate-800',
        roundings[rounded],
        className
      )}
      {...props}
    />
  );
}
