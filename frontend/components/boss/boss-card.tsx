'use client';

import * as React from 'react';
import Link from 'next/link';
import { Flame, Calendar, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BossProgress } from './boss-progress';
import { BOSS_DIFFICULTY_CONFIG } from '@/features/boss-quests/boss-engine';
import type { BossQuestWithDetails } from '@/features/boss-quests/types';

export interface BossCardProps {
  boss: BossQuestWithDetails;
  className?: string;
}

export function BossCard({ boss, className }: BossCardProps) {
  const diffConfig = BOSS_DIFFICULTY_CONFIG[boss.difficulty] || BOSS_DIFFICULTY_CONFIG.Epic;
  const isCompleted = boss.status === 'COMPLETED';

  return (
    <Card
      variant={isCompleted ? 'muted' : 'default'}
      className={className}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Flame className="h-3 w-3 text-red-500" />
                Boss Quest
              </span>
              <Badge variant={diffConfig.badgeVariant} size="sm">
                {boss.difficulty}
              </Badge>
              {isCompleted ? (
                <Badge variant="success" size="sm" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Defeated
                </Badge>
              ) : (
                <Badge variant="default" size="sm">
                  Active
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">
              {boss.title}
            </CardTitle>
          </div>

          <Badge variant="rpg" size="md" className="gap-1 font-bold shrink-0">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>+{boss.rewardXp} XP</span>
          </Badge>
        </div>

        {boss.description && (
          <CardDescription className="line-clamp-2 text-xs pt-1">
            {boss.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Boss HP bar */}
        <BossProgress
          progressPercent={boss.progressPercent}
          totalObjectives={boss.totalObjectivesCount}
          completedObjectives={boss.completedObjectivesCount}
          difficulty={boss.difficulty}
          rewardXp={boss.rewardXp}
          isDefeated={boss.isDefeated}
          size="md"
        />

        {/* Quick objectives preview */}
        {boss.objectives.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Objectives ({boss.completedObjectivesCount}/{boss.totalObjectivesCount})
            </span>
            <div className="space-y-1">
              {boss.objectives.slice(0, 3).map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-muted/40"
                >
                  <span className="flex items-center gap-2 truncate pr-2">
                    {obj.isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <span className={obj.isCompleted ? 'line-through text-muted-foreground truncate' : 'text-foreground truncate'}>
                      {obj.title}
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                    {obj.completedQuestsCount}/{obj.requiredProgress}
                  </span>
                </div>
              ))}
              {boss.objectives.length > 3 && (
                <p className="text-[10px] text-muted-foreground text-center pt-0.5">
                  +{boss.objectives.length - 3} more objectives
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between">
        {boss.deadline ? (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Due {new Date(boss.deadline).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">No deadline set</span>
        )}

        <Link href={`/boss-quests/${boss.id}`}>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <span>View Battle Plan</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
