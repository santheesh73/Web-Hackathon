'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: number;
  title: string;
  tierName: string;
}

export function EvolutionModal({
  isOpen,
  onClose,
  tier,
  title,
  tierName,
}: EvolutionModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Character Evolution!"
      description="Your steadfast consistency and attribute mastery have triggered an evolutionary breakthrough."
    >
      <div className="space-y-6 text-center pt-2">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-xl shadow-red-500/25 flex items-center justify-center"
          >
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-red-500 animate-bounce" />
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <Badge variant="rpg" size="md" className="uppercase tracking-widest font-mono text-xs">
            Ascension Achieved
          </Badge>
        </div>

        <div className="p-4 rounded-xl border border-border bg-gradient-to-b from-card to-muted/40 text-center space-y-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
            New Ascended Title
          </span>
          <h3 className="text-xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-red-500" />
            {title}
            <Sparkles className="h-5 w-5 text-red-500" />
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Tier {tier}: {tierName} Rank
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="rpg" className="w-full sm:w-auto px-8" onClick={onClose}>
            Claim Ascended Destiny
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
