'use client';

import * as React from 'react';
import { Crown, Sparkles, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EvolutionProfile } from '@/../src/shared/types/evolution';

interface EvolutionBadgeProps {
  evolution: EvolutionProfile;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

export function EvolutionBadge({
  evolution,
  size = 'md',
  showProgress = false,
  className = '',
}: EvolutionBadgeProps) {
  const tierColor =
    evolution.tier === 4
      ? 'from-purple-600 via-pink-500 to-amber-500 text-purple-600'
      : evolution.tier === 3
      ? 'from-amber-500 to-yellow-500 text-amber-600'
      : evolution.tier === 2
      ? 'from-indigo-500 to-blue-500 text-indigo-600'
      : 'from-slate-500 to-zinc-600 text-muted-foreground';

  const tierBadgeVariant =
    evolution.tier === 4
      ? 'rpg'
      : evolution.tier === 3
      ? 'warning'
      : evolution.tier === 2
      ? 'info'
      : 'neutral';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className={`relative rounded-full p-1.5 flex items-center justify-center bg-gradient-to-tr ${tierColor} text-white shadow-sm ${evolution.auraClass}`}
        >
          {evolution.tier === 4 ? (
            <Crown className="h-4 w-4 animate-pulse" />
          ) : evolution.tier === 3 ? (
            <Sparkles className="h-4 w-4" />
          ) : evolution.tier === 2 ? (
            <Zap className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-bold tracking-tight text-foreground ${
                size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'
              }`}
            >
              {evolution.title}
            </span>
            <Badge variant={tierBadgeVariant as any} size="sm" className="capitalize text-[10px]">
              Tier {evolution.tier}: {evolution.tierName}
            </Badge>
          </div>
        </div>
      </div>

      {showProgress && evolution.nextTier && (
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between text-[11px]">
            <span>Next Ascension: Tier {evolution.nextTier.tier}</span>
            <span>{evolution.nextTier.progressPercent}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${evolution.nextTier.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
