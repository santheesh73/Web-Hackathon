'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAchievements } from '@/features/achievements/use-achievements';

export interface AchievementSummaryProps {
  className?: string;
}

export function AchievementSummary({ className }: AchievementSummaryProps) {
  const { allAchievements, summary, loading } = useAchievements();

  // Find top 2 nearest in-progress achievements (or recent unlocked if none)
  const highlightedAchievements = React.useMemo(() => {
    const inProgress = allAchievements
      .filter((a) => !a.isUnlocked && a.progress > 0)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 2);

    if (inProgress.length > 0) return inProgress;

    // Fallback to top 2 locked or unlocked
    return allAchievements.slice(0, 2);
  }, [allAchievements]);

  if (loading) {
    return (
      <Card className={cn('p-6 animate-pulse border-border/40 bg-card/40', className)}>
        <div className="flex justify-between items-center mb-4">
          <div className="w-32 h-5 bg-muted/60 rounded" />
          <div className="w-16 h-5 bg-muted/40 rounded" />
        </div>
        <div className="w-full h-2.5 bg-muted/50 rounded-full mb-4" />
        <div className="space-y-2">
          <div className="w-full h-8 bg-muted/30 rounded" />
          <div className="w-full h-8 bg-muted/30 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base">Achievements & Milestones</CardTitle>
              <CardDescription className="text-xs">
                Proof of progress across your life goals and RPG progression.
              </CardDescription>
            </div>
          </div>

          <Link href="/achievements">
            <Badge variant="rpg" size="sm" className="gap-1 cursor-pointer hover:opacity-90">
              {summary.unlockedCount} / {summary.total} Unlocked
            </Badge>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Completion Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall Milestone Completion</span>
            <span className="font-mono font-semibold text-foreground">
              {summary.completionPercent}%
            </span>
          </div>
          <Progress
            value={summary.unlockedCount}
            max={summary.total}
            variant="accent"
            size="sm"
          />
        </div>

        {/* Highlighted In-Progress Items */}
        <div className="space-y-2 pt-1">
          {highlightedAchievements.map((ach) => (
            <Link key={ach.id} href="/achievements" className="block">
              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between gap-3 group">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {ach.name}
                    </span>
                    {ach.isUnlocked ? (
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {ach.progress} / {ach.target}
                      </span>
                    )}
                  </div>
                  <Progress
                    value={ach.progress}
                    max={ach.target}
                    variant={ach.isUnlocked ? 'success' : 'primary'}
                    size="sm"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="pt-2 border-t border-border/40 flex justify-end">
          <Link
            href="/achievements"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            View All Achievements <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
