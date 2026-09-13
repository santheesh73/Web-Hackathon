'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getXpProgress } from '@/features/progression/level-engine';
import { cn } from '@/lib/utils';

export interface XPBarProps {
  xp: number;
  className?: string;
  showDetails?: boolean;
}

export function XPBar({ xp = 0, className, showDetails = true }: XPBarProps) {
  const progress = getXpProgress(xp);

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {showDetails && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            <span>Level {progress.currentLevel}</span>
          </div>
          <div className="text-muted-foreground">
            <span className="font-bold text-red-600 dark:text-red-400">{xp}</span>
            <span className="text-[11px]"> / {progress.nextLevelXp} XP</span>
            <span className="ml-1.5 font-bold text-foreground">({progress.progressPercent}%)</span>
          </div>
        </div>
      )}

      {/* Bar container */}
      <div
        role="progressbar"
        aria-valuenow={progress.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${progress.currentLevel} progression`}
        className="w-full h-3 rounded-full bg-surface-muted border border-border/80 overflow-hidden relative"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 shadow-sm"
        />
      </div>

      {showDetails && (
        <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
          <span>{progress.xpInCurrentLevel} XP in this tier</span>
          <span>{progress.xpNeededForNextLevel - progress.xpInCurrentLevel} XP to Level {progress.nextLevel}</span>
        </div>
      )}
    </div>
  );
}
