'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Swords,
  Skull,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BossProgress } from '@/components/boss/boss-progress';
import { BossObjectives } from '@/components/boss/boss-objectives';
import { BossCompletionModal } from '@/components/boss/boss-completion-modal';
import { useBossQuests } from '@/features/boss-quests/use-boss-quests';
import { BOSS_DIFFICULTY_CONFIG } from '@/features/boss-quests/boss-engine';
import type { BossQuestWithDetails } from '@/features/boss-quests/types';

export default function BossDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bossId = params.bossId as string;

  const {
    bossQuests,
    loading,
    error,
    getBossQuestById,
    deleteBossQuest,
    addObjective,
    deleteObjective,
    linkQuest,
    unlinkQuest,
  } = useBossQuests();

  const [boss, setBoss] = React.useState<BossQuestWithDetails | null>(null);
  const [fetching, setFetching] = React.useState<boolean>(true);
  const [showAddObjDialog, setShowAddObjDialog] = React.useState<boolean>(false);
  const [newObjTitle, setNewObjTitle] = React.useState<string>('');
  const [newObjDesc, setNewObjDesc] = React.useState<string>('');
  const [newObjProgress, setNewObjProgress] = React.useState<number>(1);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [victoryModalOpen, setVictoryModalOpen] = React.useState<boolean>(false);

  const loadBoss = React.useCallback(async () => {
    if (!bossId) return;
    setFetching(true);
    const data = await getBossQuestById(bossId);
    setBoss(data);
    setFetching(false);
  }, [bossId, getBossQuestById]);

  React.useEffect(() => {
    loadBoss();
  }, [loadBoss, bossQuests]);

  if (loading || fetching) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!boss) {
    return (
      <Card className="text-center p-12 space-y-4">
        <CardContent className="space-y-3">
          <p className="text-base font-bold text-foreground">Boss Quest not found.</p>
          <p className="text-xs text-muted-foreground">
            This Boss encounter may have been deleted or does not exist.
          </p>
          <Link href="/boss-quests">
            <Button variant="outline" size="sm">
              Back to Boss Quests
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const diffConfig = BOSS_DIFFICULTY_CONFIG[boss.difficulty] || BOSS_DIFFICULTY_CONFIG.Epic;
  const isCompleted = boss.status === 'COMPLETED';

  const handleAddObjectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjTitle.trim()) {
      setActionError('Objective title is required.');
      return;
    }

    const res = await addObjective(bossId, {
      title: newObjTitle.trim(),
      description: newObjDesc.trim() || undefined,
      requiredProgress: Number(newObjProgress) || 1,
    });

    if (res.success) {
      setShowAddObjDialog(false);
      setNewObjTitle('');
      setNewObjDesc('');
      setNewObjProgress(1);
      setActionError(null);
      await loadBoss();
    } else {
      setActionError(res.error || 'Failed to add objective');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to abandon and delete this Boss Quest?')) {
      const res = await deleteBossQuest(bossId);
      if (res.success) {
        router.push('/boss-quests');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation & Actions Topbar */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/boss-quests">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Back to Boss Quests">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="rpg" size="sm" className="gap-1 font-mono text-[10px]">
              <Flame className="h-3 w-3 text-red-500" />
              Battle Plan
            </Badge>
            <Badge variant={diffConfig.badgeVariant} size="sm">
              {boss.difficulty}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => setShowAddObjDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Objective</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
            onClick={handleDelete}
            aria-label="Delete Boss Quest"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero Battle Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <Badge variant="success" size="sm" className="gap-1 font-mono uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Conquered
                </Badge>
              ) : (
                <Badge variant="danger" size="sm" className="gap-1 font-mono uppercase animate-pulse">
                  <Skull className="h-3.5 w-3.5" />
                  Active Challenge
                </Badge>
              )}

              {boss.deadline && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due {new Date(boss.deadline).toLocaleDateString()}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {boss.title}
            </h1>

            {boss.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {boss.description}
              </p>
            )}
          </div>

          <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 shrink-0">
            <Badge variant="rpg" size="md" className="gap-1.5 font-mono text-sm py-1.5 px-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>+{boss.rewardXp} XP Bounty</span>
            </Badge>

            {isCompleted && (
              <Button
                variant="rpg"
                size="sm"
                className="gap-1 text-xs"
                onClick={() => setVictoryModalOpen(true)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>View Victory</span>
              </Button>
            )}
          </div>
        </div>

        {/* Boss HP Gauge */}
        <div className="pt-2 border-t border-border">
          <BossProgress
            progressPercent={boss.progressPercent}
            totalObjectives={boss.totalObjectivesCount}
            completedObjectives={boss.completedObjectivesCount}
            difficulty={boss.difficulty}
            rewardXp={boss.rewardXp}
            isDefeated={boss.isDefeated}
            size="lg"
          />
        </div>
      </div>

      {/* Battle Objectives Section */}
      <BossObjectives
        boss={boss}
        onLinkQuest={async (objId, questId) => {
          const res = await linkQuest(bossId, objId, questId);
          if (res.success) await loadBoss();
          return res;
        }}
        onUnlinkQuest={async (objId, questId) => {
          const res = await unlinkQuest(bossId, objId, questId);
          if (res.success) await loadBoss();
          return res;
        }}
        onDeleteObjective={async (objId) => {
          const res = await deleteObjective(bossId, objId);
          if (res.success) await loadBoss();
          return res;
        }}
        readOnly={isCompleted}
      />

      {/* Add Objective Dialog */}
      <Dialog
        open={showAddObjDialog}
        onOpenChange={(open) => {
          setShowAddObjDialog(open);
          if (!open) setActionError(null);
        }}
        title="Add Milestone Objective"
        description="Define a new milestone objective to defeat this Boss."
      >
        <form onSubmit={handleAddObjectiveSubmit} className="space-y-4 pt-2">
          {actionError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs">
              {actionError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="new-obj-title">
              Objective Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="new-obj-title"
              placeholder="e.g. Complete Comprehensive Testing"
              value={newObjTitle}
              onChange={(e) => setNewObjTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="new-obj-desc">
              Description (Optional)
            </label>
            <textarea
              id="new-obj-desc"
              rows={2}
              placeholder="Key deliverables or criteria for this objective..."
              value={newObjDesc}
              onChange={(e) => setNewObjDesc(e.target.value)}
              maxLength={500}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="new-obj-req">
              Quests Required to Complete
            </label>
            <Input
              id="new-obj-req"
              type="number"
              min={1}
              max={50}
              value={newObjProgress}
              onChange={(e) => setNewObjProgress(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddObjDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="rpg" size="sm">
              Add Objective
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Victory Celebration Modal */}
      <BossCompletionModal
        isOpen={victoryModalOpen}
        onClose={() => setVictoryModalOpen(false)}
        result={{
          bossId: boss.id,
          bossTitle: boss.title,
          difficulty: boss.difficulty,
          rewardXp: boss.rewardXp,
          completedAt: boss.completedAt || new Date().toISOString(),
          defeated: true,
        }}
      />
    </div>
  );
}
