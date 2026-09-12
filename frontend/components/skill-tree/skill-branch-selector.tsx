'use client';

import * as React from 'react';
import {
  Shield,
  Brain,
  Briefcase,
  Coins,
  Palette,
  Sparkles,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { ATTRIBUTE_KEYS, ATTRIBUTE_DEFINITIONS } from '@/../src/shared/constants/attributes';
import type { AttributeKey } from '@/../src/shared/types/attribute';

const ICONS: Record<string, LucideIcon> = {
  Shield,
  Brain,
  Briefcase,
  Coins,
  Palette,
  Sparkles,
};

interface SkillBranchSelectorProps {
  selectedBranch: AttributeKey | 'ALL';
  onSelectBranch: (branch: AttributeKey | 'ALL') => void;
}

export function SkillBranchSelector({
  selectedBranch,
  onSelectBranch,
}: SkillBranchSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelectBranch('ALL')}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
          selectedBranch === 'ALL'
            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
            : 'bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground'
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        All Branches
      </button>

      {ATTRIBUTE_KEYS.map((key) => {
        const def = ATTRIBUTE_DEFINITIONS[key];
        const Icon = ICONS[def.iconName] || Sparkles;
        const isSelected = selectedBranch === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectBranch(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/70 hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{def.label.split(' ')[0]}</span>
            <span className="font-mono text-[10px] opacity-75">({def.code})</span>
          </button>
        );
      })}
    </div>
  );
}
