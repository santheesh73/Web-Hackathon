'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface LevelUpModalProps {
  open: boolean;
  newLevel: number;
  xpAwarded: number;
  onClose: () => void;
}

export function LevelUpModal({ open, newLevel, xpAwarded, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="levelup-title"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-50 w-full max-w-sm rounded-2xl border border-amber-300 bg-surface p-6 shadow-2xl text-center space-y-5"
          >
            <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg animate-bounce">
              <Trophy className="h-10 w-10" />
            </div>

            <div>
              <Badge variant="rpg" size="sm" className="mb-2">
                Level Up Achieved!
              </Badge>
              <h2 id="levelup-title" className="text-3xl font-extrabold tracking-tight text-foreground">
                Level {newLevel}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your discipline and real-world effort unlocked a new level tier!
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-amber-50/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Quest Reward</span>
              <span className="font-bold text-amber-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> +{xpAwarded} XP Earned
              </span>
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={onClose} icon={<ArrowRight className="h-4 w-4" />}>
              Continue Adventure
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
