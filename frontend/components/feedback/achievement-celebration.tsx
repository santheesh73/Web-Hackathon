'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import type { Achievement } from '@/../src/shared/types/achievement';
import { ACHIEVEMENT_CATEGORY_LABELS } from '@/../src/shared/constants/achievements';

export interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export function AchievementCelebration({
  achievement,
  onDismiss,
}: AchievementCelebrationProps) {
  React.useEffect(() => {
    if (!achievement) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  const categoryLabel = ACHIEVEMENT_CATEGORY_LABELS[achievement.category] || achievement.category;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm w-full">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-br from-amber-950/90 via-background to-card p-5 shadow-2xl backdrop-blur-md ring-1 ring-amber-500/30"
          role="alert"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start gap-4">
            {/* Trophy Icon */}
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-400">
                <Sparkles className="w-3 h-3" />
                <span>Achievement Unlocked</span>
              </div>

              <h4 className="font-bold text-base text-foreground truncate">
                {achievement.name}
              </h4>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {achievement.description}
              </p>

              <div className="pt-1 flex items-center gap-2 text-[10px] text-muted-foreground/80 font-medium">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  {categoryLabel}
                </span>
                <span>• Milestone Achieved</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Dismiss celebration"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
