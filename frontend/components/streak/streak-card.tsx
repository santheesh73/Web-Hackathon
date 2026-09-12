'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Award, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStreak } from '@/features/streak/use-streak';
import { StreakRecoveryModal } from './streak-recovery';

export interface StreakCardProps {
  className?: string;
}

export function StreakCard({ className }: StreakCardProps) {
  const { streak, status, isAtRisk, loading, recoverStreak } = useStreak();
  const [showRecoveryModal, setShowRecoveryModal] = React.useState<boolean>(false);

  if (loading) {
    return (
      <Card className={`p-6 border-border bg-surface ${className}`}>
        <div className="h-6 w-28 bg-slate-200 animate-pulse rounded mb-4" />
        <div className="h-10 w-24 bg-slate-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
      </Card>
    );
  }

  const currentStreak = streak?.currentStreak ?? 0;
  const longestStreak = streak?.longestStreak ?? 0;

  const statusBadge = (() => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active Streak
          </Badge>
        );
      case 'AT_RISK':
        return (
          <Badge variant="danger" size="sm" className="gap-1 animate-pulse">
            <ShieldAlert className="h-3 w-3" /> Streak At Risk
          </Badge>
        );
      case 'BROKEN':
        return (
          <Badge variant="neutral" size="sm">
            Broken
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            No Active Streak
          </Badge>
        );
    }
  })();

  return (
    <>
      <Card
        className={`p-6 border-2 transition-all relative overflow-hidden ${
          isAtRisk
            ? 'border-amber-400 bg-amber-50/20'
            : currentStreak > 0
            ? 'border-amber-200/80 bg-surface'
            : 'border-border bg-surface'
        } ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Current Streak
            </span>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={currentStreak}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground"
              >
                {currentStreak}
              </motion.span>
              <span className="text-sm font-semibold text-muted-foreground">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Flame Icon / Status Badge */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                currentStreak > 0
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Flame className={`h-6 w-6 ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
            </div>
            {statusBadge}
          </div>
        </div>

        {/* Longest Streak & Details */}
        <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Personal Best:</span>
            <span className="font-bold text-foreground">{longestStreak} days</span>
          </div>

          {currentStreak === 0 && (
            <span className="text-muted-foreground italic">Complete a quest today to begin!</span>
          )}
        </div>

        {/* At Risk Callout & Recovery Trigger */}
        {isAtRisk && (
          <div className="mt-4 p-3 rounded-xl border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                Yesterday was missed!
              </span>
              <p className="text-amber-700">
                Your {currentStreak}-day streak can be restored using your Streak Recovery Shield.
              </p>
            </div>
            <Button
              variant="rpg"
              size="sm"
              onClick={() => setShowRecoveryModal(true)}
              className="w-full sm:w-auto shrink-0 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Recover Streak
            </Button>
          </div>
        )}
      </Card>

      {/* Recovery Dialog */}
      <StreakRecoveryModal
        open={showRecoveryModal}
        streak={streak}
        onClose={() => setShowRecoveryModal(false)}
        onRecover={recoverStreak}
      />
    </>
  );
}
