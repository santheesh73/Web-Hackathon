'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Flame, ArrowRight, Skull } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BossCompletionResult } from '@/features/boss-quests/types';

export interface BossCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BossCompletionResult | null;
}

export function BossCompletionModal({
  isOpen,
  onClose,
  result,
}: BossCompletionModalProps) {
  if (!isOpen || !result) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Boss Defeated!"
      description="You conquered all milestone objectives and brought down a monumental real-life challenge."
    >
      <div className="space-y-6 text-center pt-2">
        {/* Animated Trophy / Skull Emblem */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-600 p-0.5 shadow-xl shadow-rose-500/25 flex items-center justify-center relative"
          >
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Flame className="w-10 h-10 text-amber-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-border">
              <Skull className="w-4 h-4 text-rose-500" />
            </div>
          </motion.div>
        </div>

        {/* Victory Badges */}
        <div className="flex justify-center items-center gap-2">
          <Badge variant="rpg" size="md" className="uppercase tracking-widest font-mono text-xs">
            Boss Conquered
          </Badge>
          <Badge variant="neutral" size="md">
            {result.difficulty}
          </Badge>
        </div>

        {/* Boss Title & XP Reward Card */}
        <div className="p-5 rounded-xl border border-border bg-gradient-to-b from-card to-muted/40 text-center space-y-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono font-semibold">
            Conquered Challenge
          </span>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {result.bossTitle}
            <Sparkles className="h-5 w-5 text-amber-500" />
          </h3>

          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Trophy className="h-5 w-5" />
              <span className="text-xl font-extrabold font-mono">+{result.rewardXp} XP</span>
            </div>
          </div>
        </div>

        {/* Claim button */}
        <div className="flex justify-center pt-2">
          <Button variant="rpg" className="w-full sm:w-auto px-8" onClick={onClose}>
            <span>Claim Victory Rewards</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
