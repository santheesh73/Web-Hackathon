'use client';

import * as React from 'react';
import { Trophy, Swords, CheckCircle2, TrendingUp, Flame, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getXpProgress } from '@/features/progression/level-engine';

export interface ProgressionSummaryProps {
  xp: number;
  level?: number;
  characterName?: string;
  activeQuestsCount?: number;
  completedQuestsCount?: number;
  streakDays?: number;
  availableSp?: number;
  className?: string;
}

export function ProgressionSummary({
  xp = 0,
  level,
  characterName = 'Adventurer',
  activeQuestsCount = 0,
  completedQuestsCount = 0,
  streakDays,
  availableSp,
  className,
}: ProgressionSummaryProps) {
  const progress = getXpProgress(xp);
  const currentLevel = level ?? progress.currentLevel;

  const hasAdvancedMetrics = streakDays !== undefined || availableSp !== undefined;

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Active Quests */}
        <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Quests</span>
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Swords className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-foreground">{activeQuestsCount}</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">in progress</span>
          </div>
        </Card>

        {/* Metric 2: Conquered Quests */}
        <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Conquered</span>
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-foreground">{completedQuestsCount}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">completed</span>
          </div>
        </Card>

        {/* Metric 3: Streak Days (or Level) */}
        {hasAdvancedMetrics ? (
          <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Streak</span>
              <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-foreground">{streakDays ?? 0}</span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                {(streakDays ?? 0) === 1 ? 'day active' : 'days active'}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Hero Level</span>
              <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-foreground">Level {currentLevel}</span>
              <Badge variant="rpg" size="sm">Tier {currentLevel}</Badge>
            </div>
          </Card>
        )}

        {/* Metric 4: Available SP (or Total XP) */}
        {hasAdvancedMetrics ? (
          <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Skill Points</span>
              <div className="h-6 w-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-foreground">{availableSp ?? 0}</span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">SP ready</span>
            </div>
          </Card>
        ) : (
          <Card className="p-3.5 sm:p-4 border-border bg-surface flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Experience</span>
              <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-foreground">{xp}</span>
              <span className="text-[11px] text-muted-foreground font-semibold">Total XP</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
