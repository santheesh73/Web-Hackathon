'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestCategoryBadge } from '@/components/quests/quest-category';
import { QuestCompletionModal } from '@/components/quests/quest-completion-modal';
import { LevelUpModal } from '@/components/progression/level-up-modal';
import { useQuests } from '@/features/quests/use-quests';
import type { Quest, QuestCompletionResult } from '@/../src/shared/types/quest';

export default function QuestDetailsPage() {
  const params = useParams();
  const questId = params?.questId as string;

  const { getQuestById, completeQuest } = useQuests();
  const [quest, setQuest] = React.useState<Quest | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [completing, setCompleting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Completion & Level up modals
  const [completionResult, setCompletionResult] = React.useState<QuestCompletionResult | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = React.useState<boolean>(false);
  const [levelUpData, setLevelUpData] = React.useState<{ newLevel: number; xpAwarded: number }>({
    newLevel: 1,
    xpAwarded: 0,
  });

  const loadQuest = React.useCallback(async () => {
    if (!questId) return;
    setLoading(true);
    setError(null);
    const q = await getQuestById(questId);
    if (q) {
      setQuest(q);
    } else {
      setError('Quest not found');
    }
    setLoading(false);
  }, [questId, getQuestById]);

  React.useEffect(() => {
    loadQuest();
  }, [loadQuest]);

  const handleComplete = async () => {
    if (!quest || completing || quest.status === 'COMPLETED') return;
    setCompleting(true);
    setError(null);

    const res = await completeQuest(quest.id);
    setCompleting(false);

    if (res.success && res.result) {
      setQuest({
        ...quest,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });
      setCompletionResult(res.result);
      setShowCompletionModal(true);
    } else {
      setError(res.error || 'Failed to complete quest');
    }
  };

  const handleOpenLevelUp = (newLevel: number, xpAwarded: number) => {
    setLevelUpData({ newLevel, xpAwarded });
    setShowLevelUpModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-8 px-4">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
        <div className="h-12 w-3/4 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-64 w-full bg-slate-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !quest) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Quest Not Found</h2>
        <p className="text-sm text-muted-foreground">
          {error || 'The quest you are looking for does not exist or has been removed.'}
        </p>
        <div className="pt-4">
          <Link href="/quests">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Quest Board
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = quest.status === 'COMPLETED';
  const isOverdue =
    !isCompleted && quest.dueDate && new Date(quest.dueDate).getTime() < Date.now();

  const difficultyVariant =
    quest.difficulty === 'Hard' ? 'danger' : quest.difficulty === 'Medium' ? 'warning' : 'neutral';

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Navigation link */}
      <div>
        <Link
          href="/quests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Quest Board
        </Link>
      </div>

      {/* Main Quest Container Card */}
      <Card
        className={`p-6 sm:p-8 space-y-6 transition-all border-2 ${
          isCompleted ? 'border-emerald-200 bg-emerald-50/10' : 'border-border bg-surface'
        }`}
      >
        {/* Header Tags & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            <QuestCategoryBadge category={quest.category} size="md" />
            <Badge variant={difficultyVariant} size="sm">
              {quest.difficulty}
            </Badge>
            <Badge variant="rpg" size="sm" className="gap-1">
              <Sparkles className="h-3 w-3" /> +{quest.xpReward} XP
            </Badge>
          </div>

          <div>
            {isCompleted ? (
              <Badge variant="success" size="md" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </Badge>
            ) : isOverdue ? (
              <Badge variant="danger" size="md" className="gap-1.5">
                <AlertCircle className="h-4 w-4" /> Overdue
              </Badge>
            ) : (
              <Badge variant="default" size="md" className="gap-1.5">
                <Clock className="h-4 w-4" /> Active
              </Badge>
            )}
          </div>
        </div>

        {/* Quest Title & Full Description */}
        <div className="space-y-3">
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isCompleted ? 'text-muted-foreground line-through decoration-slate-400' : 'text-foreground'
            }`}
          >
            {quest.title}
          </h1>

          <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            {quest.description || 'No additional quest details provided.'}
          </div>
        </div>

        {/* Timeline & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Calendar className="h-3.5 w-3.5" /> Due Date
            </div>
            <div className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
              {quest.dueDate
                ? new Date(quest.dueDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No deadline set'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-surface-muted/40 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5" /> Created
            </div>
            <div className="font-semibold text-foreground">
              {new Date(quest.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* If completed, show completion certificate */}
        {isCompleted && (
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Quest Completed Successfully</p>
                <p className="text-emerald-700">
                  +{quest.xpReward} XP has been permanently credited to your character progression.
                </p>
              </div>
            </div>
            {quest.completedAt && (
              <span className="text-[11px] text-emerald-700/80 font-mono">
                {new Date(quest.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          {!isCompleted ? (
            <Button
              variant="rpg"
              size="lg"
              onClick={handleComplete}
              disabled={completing}
              className="w-full sm:w-auto gap-2 text-base font-bold shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="h-5 w-5" />
              {completing ? 'Validating Completion...' : `Complete Quest (+${quest.xpReward} XP)`}
            </Button>
          ) : (
            <Link href="/quests">
              <Button variant="outline" size="md">
                Return to Quest Board
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Completion Modal */}
      <QuestCompletionModal
        open={showCompletionModal}
        result={completionResult}
        onClose={() => setShowCompletionModal(false)}
        onOpenLevelUp={handleOpenLevelUp}
      />

      {/* Level Up Modal */}
      <LevelUpModal
        open={showLevelUpModal}
        newLevel={levelUpData.newLevel}
        xpAwarded={levelUpData.xpAwarded}
        onClose={() => setShowLevelUpModal(false)}
      />
    </div>
  );
}
