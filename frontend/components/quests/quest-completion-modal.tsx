'use client';

import * as React from 'react';
import { CheckCircle2, Sparkles, Trophy, ArrowRight, Flame, Layers } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuestCompletionResult } from '@/../src/shared/types/quest';

export interface QuestCompletionModalProps {
  open: boolean;
  result: (QuestCompletionResult & {
    streak?: {
      currentStreak: number;
      longestStreak: number;
      firstToday: boolean;
      streakExtended: boolean;
      isNewRecord: boolean;
    };
    chainProgress?: {
      chainId: string;
      chainTitle: string;
      completedStepOrder: number;
      totalSteps: number;
      completedSteps: number;
      isChainCompleted: boolean;
      nextStepOrder?: number;
    } | null;
  }) | null;
  onClose: () => void;
  onOpenLevelUp?: (newLevel: number, xpAwarded: number) => void;
}

export function QuestCompletionModal({
  open,
  result,
  onClose,
  onOpenLevelUp,
}: QuestCompletionModalProps) {
  if (!result) return null;

  const handleContinue = () => {
    onClose();
    if (result.leveledUp && onOpenLevelUp) {
      onOpenLevelUp(result.newLevel, result.xpAwarded);
    }
  };

  const streak = result.streak;
  const chainProgress = result.chainProgress;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleContinue();
      }}
      title="Quest Completed!"
      description="You conquered your real-life task and gained experience."
    >
      <div className="space-y-4">
        {/* Quest Title Card */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h4 className="font-bold text-base text-foreground">{result.quest.title}</h4>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Badge variant="rpg" size="sm">
              +{result.xpAwarded} XP Earned
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">
              Category: {result.quest.category}
            </span>
          </div>
        </div>

        {/* Streak Feedback if active */}
        {streak && streak.firstToday && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Flame className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <span className="font-bold text-amber-900 block">
                  {streak.isNewRecord
                    ? 'New Personal Best Streak!'
                    : streak.streakExtended
                    ? `Streak Extended: ${streak.currentStreak} Days!`
                    : '+1 Day Streak Started!'}
                </span>
                <span className="text-amber-700 text-[11px]">
                  Daily consistency recorded for today.
                </span>
              </div>
            </div>
            <Badge variant="rpg" size="sm">
              {streak.currentStreak} Days
            </Badge>
          </div>
        )}

        {/* Quest Chain Progress if active */}
        {chainProgress && (
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span>{chainProgress.chainTitle}</span>
              </div>
              <Badge variant="neutral" size="sm">
                Step {chainProgress.completedStepOrder} of {chainProgress.totalSteps}
              </Badge>
            </div>
            <p className="text-indigo-700 text-[11px]">
              {chainProgress.isChainCompleted
                ? 'Mastery Achieved! Entire quest chain completed!'
                : `Step ${chainProgress.completedStepOrder} completed. Next step unlocked!`}
            </p>
          </div>
        )}

        {/* Level Up Notice if applicable */}
        {result.leveledUp ? (
          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span>Level Up Ready: Level {result.previousLevel} &rarr; Level {result.newLevel}!</span>
            </div>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-border bg-surface-muted text-xs text-muted-foreground flex items-center justify-between">
            <span>Character Progression</span>
            <span className="font-semibold text-foreground">Total XP: {result.character.xp}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={handleContinue} className="gap-1.5 shadow-sm">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
