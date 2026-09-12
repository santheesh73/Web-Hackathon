'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Quest } from '@/../src/shared/types/quest';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XPReward } from '@/components/progression/xp-reward';
import { QuestCategoryBadge } from './quest-category';
import { QuestCompleteButton } from './quest-complete-button';
import { cn } from '@/lib/utils';

export interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => Promise<void>;
  completing?: boolean;
}

export function QuestCard({ quest, onComplete, completing = false }: QuestCardProps) {
  const isCompleted = quest.status === 'COMPLETED';

  // Check if overdue
  const isOverdue = React.useMemo(() => {
    if (isCompleted || !quest.dueDate) return false;
    const due = new Date(quest.dueDate).getTime();
    return due < Date.now();
  }, [quest.dueDate, isCompleted]);

  const formattedDue = React.useMemo(() => {
    if (!quest.dueDate) return null;
    const d = new Date(quest.dueDate);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, [quest.dueDate]);

  const difficultyVariants: Record<string, 'neutral' | 'info' | 'warning'> = {
    Easy: 'neutral',
    Medium: 'info',
    Hard: 'warning',
  };

  return (
    <Card
      variant={isCompleted ? 'muted' : 'interactive'}
      className={cn(
        'transition-all relative overflow-hidden',
        isCompleted && 'opacity-75 bg-surface-muted/60',
        isOverdue && 'border-amber-300'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <QuestCategoryBadge category={quest.category} />
              <Badge variant={difficultyVariants[quest.difficulty] || 'neutral'} size="sm">
                {quest.difficulty}
              </Badge>
              {isOverdue && (
                <Badge variant="warning" size="sm" className="gap-1 text-amber-700 bg-amber-50">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  <span>Overdue</span>
                </Badge>
              )}
            </div>

            <Link href={`/quests/${quest.id}`} className="block group">
              <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors flex items-center gap-1">
                <span className={cn(isCompleted && 'line-through text-muted-foreground')}>
                  {quest.title}
                </span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary" />
              </CardTitle>
            </Link>

            {quest.description && (
              <CardDescription className="line-clamp-2 text-xs">
                {quest.description}
              </CardDescription>
            )}
          </div>

          <div className="shrink-0">
            <XPReward xp={quest.xpReward} />
          </div>
        </div>
      </CardHeader>

      <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground border-t border-border/40 pt-3">
        <div className="flex items-center gap-2">
          {formattedDue ? (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                isOverdue ? 'text-amber-600 font-bold' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" /> Due {formattedDue}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Flexible timing</span>
          )}
        </div>

        {onComplete && (
          <QuestCompleteButton
            quest={quest}
            onComplete={onComplete}
            loading={completing}
            size="sm"
          />
        )}
      </CardFooter>
    </Card>
  );
}
