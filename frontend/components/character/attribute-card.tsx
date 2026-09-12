'use client';

import * as React from 'react';
import {
  Shield,
  Brain,
  Briefcase,
  Coins,
  Palette,
  Sparkles,
  LucideIcon,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ATTRIBUTE_DEFINITIONS } from '@/../src/shared/constants/attributes';
import type {
  AttributeKey,
  CharacterAttribute,
  AttributeProgressInfo,
} from '@/../src/shared/types/attribute';

const ICONS: Record<string, LucideIcon> = {
  Shield,
  Brain,
  Briefcase,
  Coins,
  Palette,
  Sparkles,
};

interface AttributeCardProps {
  attribute: CharacterAttribute;
  progress?: AttributeProgressInfo;
  className?: string;
}

export function AttributeCard({ attribute, progress, className = '' }: AttributeCardProps) {
  const def = ATTRIBUTE_DEFINITIONS[attribute.attributeKey];
  const Icon = ICONS[def.iconName] || Sparkles;

  const currentLevel = progress ? progress.level : attribute.level;
  const progressPercent = progress ? progress.progressPercent : 0;
  const xpInLevel = progress ? progress.xpInCurrentLevel : 0;
  const xpNeeded = progress ? progress.xpNeededForNextLevel : 50;

  return (
    <Card variant="interactive" className={`relative overflow-hidden group ${className}`}>
      <div
        className={`absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b ${def.color}`}
      />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg border ${def.accentColor} flex items-center justify-center`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-sm text-foreground">{def.label}</h4>
                <Badge variant="neutral" size="sm" className="font-mono text-[10px] py-0 px-1">
                  {def.code}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{def.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Badge variant="rpg" size="sm" className="font-bold">
              Lvl {currentLevel}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              Progress
            </span>
            <span className="font-mono">
              {xpInLevel} / {xpNeeded} XP ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Quest Category Link */}
        <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Fueled by:</span>
          <span className="font-medium text-foreground">{def.category} Quests</span>
        </div>
      </CardContent>
    </Card>
  );
}
