'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Swords, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { AchievementWithProgress } from '@/../src/shared/types/achievement';
import { AchievementCard } from './achievement-card';

export interface AchievementGridProps {
  achievements: AchievementWithProgress[];
  loading: boolean;
  onSelect: (achievement: AchievementWithProgress) => void;
  className?: string;
}

export function AchievementGrid({
  achievements,
  loading,
  onSelect,
  className,
}: AchievementGridProps) {
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 h-44 animate-pulse flex flex-col justify-between border-border/40 bg-card/40">
            <div className="flex justify-between items-center">
              <div className="w-20 h-4 bg-muted/60 rounded" />
              <div className="w-16 h-4 bg-muted/40 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted/60 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="w-3/4 h-4 bg-muted/60 rounded" />
                <div className="w-full h-3 bg-muted/40 rounded" />
              </div>
            </div>
            <div className="pt-3 border-t border-border/30">
              <div className="w-full h-2 bg-muted/50 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/70 bg-card/30">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-foreground">No Achievements Found</h3>
        <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
          No milestones match your current filter criteria. Continue completing quests, maintaining daily streaks, and conquering boss encounters to unlock achievements!
        </p>

        <Link href="/quests">
          <Button variant="primary" className="gap-2 text-xs">
            <Swords className="w-4 h-4" />
            Explore Quests
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4', className)}
    >
      {achievements.map((ach) => (
        <motion.div key={ach.id} variants={fadeInUp}>
          <AchievementCard
            achievement={ach}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
