'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BossDifficulty } from '@/features/boss-quests/types';

export interface BossProgressProps {
  progressPercent: number;
  totalObjectives: number;
  completedObjectives: number;
  difficulty?: BossDifficulty;
  rewardXp?: number;
  isDefeated?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function BossProgress({
  progressPercent = 0,
  totalObjectives = 0,
  completedObjectives = 0,
  difficulty = 'Epic',
  rewardXp = 500,
  isDefeated = false,
  className,
  size = 'md',
  showDetails = true,
}: BossProgressProps) {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(progressPercent)));
  const remainingPercent = 100 - clampedPercent;

  // Boss HP style: Full HP at start (0% completed = 100% HP remaining).
  // As user completes objectives, Boss HP depletes!
  const hpPercent = isDefeated ? 0 : remainingPercent;
  const currentHp = Math.max(0, Math.round((hpPercent / 100) * rewardXp));

  const heightClasses = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  };

  const getBarColor = () => {
    if (isDefeated) return 'from-emerald-500 to-teal-400';
    if (hpPercent <= 25) return 'from-red-600 via-rose-500 to-red-600';
    if (hpPercent <= 50) return 'from-amber-500 via-orange-500 to-red-500';
    return 'from-purple-600 via-rose-500 to-amber-500';
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {showDetails && (
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            {isDefeated ? (
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                Boss Defeated
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-foreground font-bold uppercase tracking-wider">
                <Flame className="h-4 w-4 text-red-500 animate-pulse" />
                Boss HP
              </span>
            )}
            <span className="text-[11px] text-muted-foreground font-normal">
              ({completedObjectives}/{totalObjectives} Objectives)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {isDefeated ? (
              <span className="text-emerald-500 font-bold">100% Cleared</span>
            ) : (
              <>
                <span className="text-foreground font-bold">{currentHp}</span>
                <span className="text-muted-foreground">/ {rewardXp} HP</span>
                <span className="text-amber-500 font-bold">({clampedPercent}%)</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* RPG Health Bar Container */}
      <div
        role="progressbar"
        aria-valuenow={clampedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Boss Quest progression ${clampedPercent}% complete`}
        className={cn(
          'w-full rounded-full bg-slate-900/90 border-2 border-slate-800 p-0.5 shadow-inner overflow-hidden relative',
          heightClasses[size]
        )}
      >
        {/* Depleted background indicator */}
        <div className="absolute inset-0 bg-red-950/40 opacity-50" />

        {/* Animated Active Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r relative shadow-lg',
            getBarColor()
          )}
        >
          {/* Subtle glowing pulse line */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-[1px] rounded-r-full" />
        </motion.div>
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 font-mono">
            <ShieldAlert className="h-3 w-3 text-muted-foreground" />
            Difficulty: <strong className="text-foreground">{difficulty}</strong>
          </span>
          <span>
            XP Bounty: <strong className="text-amber-500 font-bold">+{rewardXp} XP</strong>
          </span>
        </div>
      )}
    </div>
  );
}
