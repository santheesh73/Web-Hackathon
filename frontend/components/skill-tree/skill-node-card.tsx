'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ArrowRight,
  Heart,
  Shield,
  Flame,
  BookOpen,
  Brain,
  Target,
  Briefcase,
  Hammer,
  Scale,
  Coins,
  Lightbulb,
  Palette,
  LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SkillNodeWithState } from '@/../src/shared/types/skill';

const SKILL_ICONS: Record<string, LucideIcon> = {
  Heart,
  Shield,
  Flame,
  BookOpen,
  Brain,
  Target,
  Briefcase,
  Hammer,
  Scale,
  Coins,
  Lightbulb,
  Palette,
  Sparkles,
};

interface SkillNodeCardProps {
  skill: SkillNodeWithState;
  onSelectUnlock: (skill: SkillNodeWithState) => void;
  className?: string;
}

export function SkillNodeCard({
  skill,
  onSelectUnlock,
  className = '',
}: SkillNodeCardProps) {
  const Icon = SKILL_ICONS[skill.iconName] || Sparkles;

  return (
    <Card
      variant={skill.isUnlocked ? 'selected' : skill.canUnlock ? 'interactive' : 'muted'}
      className={`relative overflow-hidden transition-all ${
        skill.canUnlock ? 'ring-2 ring-indigo-500/40 shadow-md' : ''
      } ${className}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Tier, Cost & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge
              variant={skill.isUnlocked ? 'rpg' : 'neutral'}
              size="sm"
              className="text-[10px] font-mono uppercase"
            >
              Tier {skill.tier}
            </Badge>
            <Badge
              variant="neutral"
              size="sm"
              className="text-[10px] font-mono text-muted-foreground"
            >
              {skill.spCost} SP
            </Badge>
          </div>

          <div>
            {skill.isUnlocked ? (
              <Badge variant="success" size="sm" className="gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" />
                Mastered
              </Badge>
            ) : skill.canUnlock ? (
              <Badge variant="info" size="sm" className="gap-1 text-[11px] animate-pulse">
                <Sparkles className="h-3 w-3" />
                Available
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="gap-1 text-[11px]">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
        </div>

        {/* Skill Title & Icon */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              skill.isUnlocked
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : skill.canUnlock
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-sm text-foreground tracking-tight line-clamp-1">
              {skill.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {skill.description}
            </p>
          </div>
        </div>

        {/* Perk Effect Box */}
        <div className="p-2.5 rounded-lg border border-border/80 bg-muted/40 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="line-clamp-1">{skill.perkEffect}</span>
          </div>
        </div>

        {/* Action Button or Missing Requirements */}
        <div>
          {skill.isUnlocked ? (
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 text-center py-1">
              Perk active and permanent
            </div>
          ) : skill.canUnlock ? (
            <Button
              variant="rpg"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => onSelectUnlock(skill)}
            >
              Learn Capability
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <div className="space-y-1 pt-1">
              <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Requirements:
              </div>
              <ul className="text-[10px] text-muted-foreground list-disc list-inside space-y-0.5">
                {skill.missingRequirements.map((req, idx) => (
                  <li key={idx} className="line-clamp-1">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
