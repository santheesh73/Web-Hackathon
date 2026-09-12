'use client';

import * as React from 'react';
import { ShieldCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Streak, StreakRecoveryResult } from '@/../src/shared/types/streak';

export interface StreakRecoveryModalProps {
  open: boolean;
  streak: Streak | null;
  onClose: () => void;
  onRecover: () => Promise<StreakRecoveryResult>;
}

export function StreakRecoveryModal({
  open,
  streak,
  onClose,
  onRecover,
}: StreakRecoveryModalProps) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<StreakRecoveryResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    const res = await onRecover();
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message);
    }
  };

  const handleModalClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleModalClose();
      }}
      title="Streak Recovery Shield"
      description="Protect your hard-earned consistency from an unexpected lapse."
    >
      <div className="space-y-4 pt-1">
        {result ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-base">Streak Restored!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {result.message} Your streak now stands at{' '}
                <span className="font-bold text-foreground">{result.newStreak} days</span>.
              </p>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={handleModalClose} className="w-full">
                Continue Progression
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-foreground">1 Free Shield Available</h4>
                    <Badge variant="rpg" size="sm">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Restores yesterday&apos;s missing activity and preserves your {streak?.currentStreak ?? 0}-day streak.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-amber-800 bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                <strong>Recovery Policy:</strong> Streak recovery is strictly limited to 1 missed calendar day.
                This shield consumes your current recovery allocation.
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleModalClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="rpg"
                size="sm"
                onClick={handleConfirm}
                disabled={loading}
                className="gap-1.5 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? 'Restoring...' : 'Consume Shield & Recover'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
