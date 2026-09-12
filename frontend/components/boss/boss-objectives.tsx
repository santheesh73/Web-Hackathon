'use client';

import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Link as LinkIcon,
  Unlink,
  Swords,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useQuests } from '@/features/quests/use-quests';
import type { BossObjectiveWithQuests, BossQuestWithDetails } from '@/features/boss-quests/types';

export interface BossObjectivesProps {
  boss: BossQuestWithDetails;
  onLinkQuest?: (objectiveId: string, questId: string) => Promise<{ success: boolean; error?: string }>;
  onUnlinkQuest?: (objectiveId: string, questId: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteObjective?: (objectiveId: string) => Promise<{ success: boolean; error?: string }>;
  readOnly?: boolean;
}

export function BossObjectives({
  boss,
  onLinkQuest,
  onUnlinkQuest,
  onDeleteObjective,
  readOnly = false,
}: BossObjectivesProps) {
  const { allQuests } = useQuests();
  const [linkingObjective, setLinkingObjective] = React.useState<BossObjectiveWithQuests | null>(null);
  const [expandedObjectives, setExpandedObjectives] = React.useState<Record<string, boolean>>({});
  const [actionError, setActionError] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedObjectives((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isBossCompleted = boss.status === 'COMPLETED' || readOnly;

  if (!boss.objectives || boss.objectives.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Break this goal into your first objective.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono">
          Battle Objectives ({boss.completedObjectivesCount} / {boss.totalObjectivesCount} Completed)
        </h3>
      </div>

      <div className="space-y-3">
        {boss.objectives.map((obj, idx) => {
          const isExpanded = expandedObjectives[obj.id] ?? true;
          const isCompleted = obj.isCompleted;

          return (
            <Card
              key={obj.id}
              variant={isCompleted ? 'muted' : 'default'}
              className="transition-all"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-bold">
                        OBJECTIVE {String(idx + 1).padStart(2, '0')}
                      </span>
                      {isCompleted ? (
                        <Badge variant="success" size="sm" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="rpg" size="sm">
                          {obj.progressPercent}%
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold">
                      {obj.title}
                    </CardTitle>
                    {obj.description && (
                      <CardDescription className="text-xs">
                        {obj.description}
                      </CardDescription>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {obj.completedQuestsCount} / {obj.requiredProgress} Quests
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => toggleExpand(obj.id)}
                      aria-label="Toggle objective details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress bar inside objective */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${obj.progressPercent}%` }}
                  />
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="px-4 pb-4 pt-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Swords className="h-3.5 w-3.5" />
                        Linked Quests ({obj.linkedQuests.length})
                      </span>
                      {!isBossCompleted && onLinkQuest && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => setLinkingObjective(obj)}
                        >
                          <Plus className="h-3 w-3" />
                          <span>Connect Quest</span>
                        </Button>
                      )}
                    </div>

                    {obj.linkedQuests.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic py-2 px-3 rounded-md bg-muted/30 border border-dashed border-border text-center">
                        No quests attached to this objective yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {obj.linkedQuests.map((quest) => (
                          <div
                            key={quest.id}
                            className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/40 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {quest.status === 'COMPLETED' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-amber-500 shrink-0" />
                              )}
                              <span
                                className={
                                  quest.status === 'COMPLETED'
                                    ? 'line-through text-muted-foreground truncate'
                                    : 'font-medium truncate'
                                }
                              >
                                {quest.title}
                              </span>
                              <Badge variant="neutral" size="sm" className="text-[10px]">
                                {quest.difficulty} (+{quest.xpReward} XP)
                              </Badge>
                            </div>

                            {!isBossCompleted && onUnlinkQuest && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={() => onUnlinkQuest(obj.id, quest.id)}
                                aria-label={`Unlink quest ${quest.title}`}
                              >
                                <Unlink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isBossCompleted && onDeleteObjective && (
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive gap-1 h-7"
                        onClick={() => onDeleteObjective(obj.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete Objective</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Connect Quest Modal */}
      {linkingObjective && (
        <Dialog
          open={Boolean(linkingObjective)}
          onOpenChange={(open) => {
            if (!open) {
              setLinkingObjective(null);
              setActionError(null);
            }
          }}
          title="Connect Quest to Objective"
          description={`Select an available quest to link with "${linkingObjective.title}". Completing this quest will advance this objective.`}
        >
          <div className="space-y-4 pt-2">
            {actionError && (
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
                {actionError}
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {allQuests.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No quests found. Create quests in the Quests tab first.
                </p>
              ) : (
                allQuests.map((q) => {
                  const alreadyLinked = linkingObjective.linkedQuests.some((lq) => lq.id === q.id);

                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs hover:border-amber-500/50 transition-colors"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="font-semibold text-foreground truncate">{q.title}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span>{q.category}</span>
                          <span>&bull;</span>
                          <span>+{q.xpReward} XP</span>
                          {q.status === 'COMPLETED' && (
                            <span className="text-emerald-500 font-bold">&bull; Completed</span>
                          )}
                        </div>
                      </div>

                      {alreadyLinked ? (
                        <Badge variant="neutral" size="sm">
                          Linked
                        </Badge>
                      ) : (
                        <Button
                          variant="rpg"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={async () => {
                            if (!onLinkQuest) return;
                            setActionError(null);
                            const res = await onLinkQuest(linkingObjective.id, q.id);
                            if (res.success) {
                              setLinkingObjective(null);
                            } else {
                              setActionError(res.error || 'Failed to link quest');
                            }
                          }}
                        >
                          <LinkIcon className="h-3 w-3" />
                          <span>Link</span>
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
