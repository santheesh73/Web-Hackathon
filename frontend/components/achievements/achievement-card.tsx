'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Swords,
  Award,
  Flame,
  Zap,
  Crown,
  Link as LinkIcon,
  Trophy,
  Shield,
  Sparkles,
  GitFork,
  BookOpen,
  Store,
  Backpack,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AchievementWithProgress } from '@/../src/shared/types/achievement';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  REQUIREMENT_TYPE_LABELS,
} from '@/../src/shared/constants/achievements';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckCircle2,
  Swords,
  Award,
  Flame,
  Zap,
  Crown,
  Link: LinkIcon,
  Trophy,
  Shield,
  Sparkles,
  GitFork,
  BookOpen,
  Store,
  Backpack,
};

export interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onSelect: (achievement: AchievementWithProgress) => void;
  className?: string;
}

export function AchievementCard({
  achievement,
  onSelect,
  className,
}: AchievementCardProps) {
  const IconComponent = ICON_MAP[achievement.icon] || Trophy;
  const categoryLabel =
    ACHIEVEMENT_CATEGORY_LABELS[achievement.category] || achievement.category;
  const requirementLabel =
    REQUIREMENT_TYPE_LABELS[achievement.requirementType] || achievement.requirementType;

  return (
    <Card
      variant={achievement.isUnlocked ? 'interactive' : 'default'}
      onClick={() => onSelect(achievement)}
      className={cn(
        'relative flex flex-col justify-between overflow-hidden p-5 transition-all duration-200 cursor-pointer border group',
        achievement.isUnlocked
          ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/10 via-background to-background shadow-sm hover:border-amber-500/70 hover:shadow-md'
          : achievement.progress > 0
          ? 'border-primary/40 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary hover:shadow-md'
          : 'border-border/60 bg-card/60 opacity-75 hover:opacity-100 hover:border-border',
        className
      )}
    >
      {/* Top Bar: Category & Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {categoryLabel}
        </span>

        {achievement.isUnlocked ? (
          <Badge variant="warning" size="sm" className="gap-1 font-bold">
            <Trophy className="w-3 h-3 text-amber-500" />
            UNLOCKED
          </Badge>
        ) : achievement.progress > 0 ? (
          <Badge variant="default" size="sm" className="font-semibold">
            IN PROGRESS
          </Badge>
        ) : (
          <Badge variant="neutral" size="sm" className="gap-1 text-muted-foreground">
            <Lock className="w-3 h-3" />
            LOCKED
          </Badge>
        )}
      </div>

      {/* Main Body: Icon & Info */}
      <div className="flex items-start gap-4 my-2">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-inner',
            achievement.isUnlocked
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              : achievement.progress > 0
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-muted/30 border-border/40 text-muted-foreground/50'
          )}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h4
            className={cn(
              'font-semibold text-base truncate transition-colors',
              achievement.isUnlocked
                ? 'text-foreground group-hover:text-amber-400'
                : 'text-foreground group-hover:text-primary'
            )}
            title={achievement.name}
          >
            {achievement.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2" title={achievement.description}>
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Footer: Progress Visualization or Unlock Date */}
      <div className="pt-4 mt-3 border-t border-border/40">
        {achievement.isUnlocked ? (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
            <span className="text-[11px] font-mono">
              {achievement.unlockedAt
                ? new Date(achievement.unlockedAt).toLocaleDateString()
                : 'Unlocked'}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground truncate" title={requirementLabel}>
                {requirementLabel}
              </span>
              <span className="font-mono font-semibold text-foreground shrink-0">
                {achievement.progress} / {achievement.target}
              </span>
            </div>
            <Progress
              value={achievement.progress}
              max={achievement.target}
              variant={achievement.progress > 0 ? 'primary' : 'primary'}
              size="sm"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
