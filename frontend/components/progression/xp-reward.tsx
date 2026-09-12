import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface XPRewardProps {
  xp: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function XPReward({ xp, size = 'sm', className }: XPRewardProps) {
  return (
    <Badge variant="rpg" size={size} className={cn('gap-1 font-bold', className)}>
      <Sparkles className="h-3 w-3 text-amber-500" />
      <span>+{xp} XP</span>
    </Badge>
  );
}
