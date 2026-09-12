'use client';

import * as React from 'react';
import { Trophy, Swords, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPBar } from './xp-bar';
import { getXpProgress } from '@/features/progression/level-engine';

export interface ProgressionSummaryProps {
  xp: number;
  level?: number;
  characterName?: string;
  activeQuestsCount?: number;
  completedQuestsCount?: number;
  className?: string;
}

export function ProgressionSummary({
  xp = 0,
  level,
  characterName = 'Adventurer',
  activeQuestsCount = 0,
  completedQuestsCount = 0,
  className,
}: ProgressionSummaryProps) {
  const progress = getXpProgress(xp);
  const currentLevel = level ?? progress.currentLevel;

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className="p-4 border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Hero Level</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">Level {currentLevel}</span>
            <Badge variant="rpg" size="sm">
              Tier {currentLevel}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Deterministic rank based on earned XP
          </p>
        </Card>

        {/* Total XP Card */}
        <Card className="p-4 border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Experience</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">{xp}</span>
            <span className="text-xs text-muted-foreground font-semibold">Total XP</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {progress.nextLevelXp - xp} XP needed for Level {progress.nextLevel}
          </p>
        </Card>

        {/* Active Quests Card */}
        <Card className="p-4 border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Quests</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Swords className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">{activeQuestsCount}</span>
            <span className="text-xs text-indigo-600 font-semibold">in progress</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tasks currently on your quest log
          </p>
        </Card>

        {/* Completed Quests Card */}
        <Card className="p-4 border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Conquered Quests</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground">{completedQuestsCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">completed</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Real-life milestones successfully turned to XP
          </p>
        </Card>
      </div>
    </div>
  );
}
