'use client';

import * as React from 'react';
import { CheckCircle2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Quest } from '@/../src/shared/types/quest';

export interface QuestCompleteButtonProps {
  quest: Quest;
  onComplete: (questId: string) => Promise<void>;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function QuestCompleteButton({
  quest,
  onComplete,
  loading = false,
  size = 'sm',
  fullWidth = false,
  className,
}: QuestCompleteButtonProps) {
  const isCompleted = quest.status === 'COMPLETED';

  if (isCompleted) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        className={className}
        fullWidth={fullWidth}
        icon={<Check className="h-3.5 w-3.5 text-emerald-600" />}
      >
        <span>Completed</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      loading={loading}
      fullWidth={fullWidth}
      onClick={() => onComplete(quest.id)}
      className={`border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 ${className || ''}`}
      icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
    >
      <span>Complete Quest</span>
    </Button>
  );
}
