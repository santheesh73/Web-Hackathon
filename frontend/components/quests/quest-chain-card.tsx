'use client';

import * as React from 'react';
import Link from 'next/link';
import { Link as LinkIcon, CheckCircle2, ArrowRight, Lock, Sparkles, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { QuestChainWithSteps } from '@/../src/shared/types/quest-chain';

export interface QuestChainCardProps {
  chain: QuestChainWithSteps;
  className?: string;
}

export function QuestChainCard({ chain, className }: QuestChainCardProps) {
  const isCompleted = chain.status === 'COMPLETED';
  const currentStep = chain.currentStep;

  return (
    <Link href={`/quests/chains/${chain.id}`}>
      <Card
        className={`p-5 sm:p-6 border-2 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer flex flex-col justify-between h-full group ${
          isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-border bg-surface'
        } ${className}`}
      >
        <div className="space-y-3">
          {/* Header & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Quest Chain</span>
            </div>

            {isCompleted ? (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            ) : (
              <Badge variant="rpg" size="sm" className="gap-1">
                Step {chain.completedSteps + 1} of {chain.totalSteps}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {chain.title}
            </h3>
            {chain.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {chain.description}
              </p>
            )}
          </div>

          {/* Current Step Spotlight */}
          {!isCompleted && currentStep && currentStep.quest && (
            <div className="p-3 rounded-xl border border-border bg-surface-muted/40 space-y-1 text-xs">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500" /> Current Step {currentStep.stepOrder}:
              </span>
              <p className="font-bold text-foreground line-clamp-1">
                {currentStep.quest.title}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar & Footer */}
        <div className="pt-4 mt-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Progression</span>
            <span className="text-foreground">
              {chain.completedSteps} / {chain.totalSteps} Quests ({chain.progressPercent}%)
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={chain.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${chain.title} progress`}
            className="w-full h-2 rounded-full bg-surface-muted border border-border/80 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-primary to-rose-600'
              }`}
              style={{ width: `${chain.progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-end pt-1">
            <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              View Chain Roadmap <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
