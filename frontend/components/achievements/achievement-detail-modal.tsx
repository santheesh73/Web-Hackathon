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
  X,
  Calendar,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export interface AchievementDetailModalProps {
  achievement: AchievementWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementDetailModal({
  achievement,
  isOpen,
  onClose,
}: AchievementDetailModalProps) {
  if (!isOpen || !achievement) return null;

  const IconComponent = ICON_MAP[achievement.icon] || Trophy;
  const categoryLabel =
    ACHIEVEMENT_CATEGORY_LABELS[achievement.category] || achievement.category;
  const requirementLabel =
    REQUIREMENT_TYPE_LABELS[achievement.requirementType] || achievement.requirementType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Badge variant={achievement.isUnlocked ? 'warning' : 'neutral'} size="md">
              {categoryLabel}
            </Badge>
            {achievement.isUnlocked ? (
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Unlocked
              </span>
            ) : achievement.progress > 0 ? (
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                In Progress
              </span>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Locked
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* Big Icon Showcase */}
          <div
            className={cn(
              'flex flex-col items-center justify-center p-6 rounded-xl border relative overflow-hidden',
              achievement.isUnlocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-muted/20 border-border/50 text-foreground'
            )}
          >
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg mb-3',
                achievement.isUnlocked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-background border-border text-primary'
              )}
            >
              <IconComponent className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-foreground text-center">
              {achievement.name}
            </h3>

            <p className="text-xs text-muted-foreground text-center max-w-sm mt-1">
              {achievement.description}
            </p>
          </div>

          {/* Requirement & Progress Section */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Milestone Requirement
              </span>
              <span className="font-semibold text-foreground">
                {achievement.target} {requirementLabel}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Current Progress</span>
                <span className="font-mono font-bold text-foreground">
                  {achievement.progress} / {achievement.target} ({achievement.progressPercent}%)
                </span>
              </div>
              <Progress
                value={achievement.progress}
                max={achievement.target}
                variant={achievement.isUnlocked ? 'accent' : 'primary'}
                size="md"
              />
            </div>

            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Conquered Date
                </span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {new Date(achievement.unlockedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/60 flex justify-end">
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto text-xs">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
