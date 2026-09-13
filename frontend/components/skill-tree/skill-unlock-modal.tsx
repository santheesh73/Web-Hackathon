'use client';

import * as React from 'react';
import { Zap, ArrowRight, Shield } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SkillNodeWithState } from '@/../src/shared/types/skill';

interface SkillUnlockModalProps {
  skill: SkillNodeWithState | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmUnlock: (skillId: string) => Promise<void>;
  unlocking: boolean;
}

export function SkillUnlockModal({
  skill,
  isOpen,
  onClose,
  onConfirmUnlock,
  unlocking,
}: SkillUnlockModalProps) {
  if (!skill) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title={`Unlock ${skill.title}`}
      description={skill.description}
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Badge variant="rpg" size="sm" className="font-mono text-xs">
            Tier {skill.tier} Capability
          </Badge>
          <Badge variant="neutral" size="sm" className="font-mono text-xs">
            Cost: {skill.spCost} SP
          </Badge>
        </div>

        <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/30">
          <div className="flex items-start gap-2.5">
            <Zap className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-xs text-red-950 dark:text-red-200">
                Permanent Passive Perk
              </span>
              <p className="text-xs text-red-900 dark:text-red-300 mt-0.5">
                {skill.perkEffect}
              </p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
          <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>Unlocking consumes {skill.spCost} Skill Point and cannot be reversed.</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={unlocking}>
            Cancel
          </Button>
          <Button
            variant="rpg"
            size="sm"
            onClick={() => onConfirmUnlock(skill.id)}
            disabled={unlocking}
          >
            {unlocking ? 'Attuning...' : `Attune (${skill.spCost} SP)`}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
