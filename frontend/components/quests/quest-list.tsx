'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swords, Search, Plus, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { useQuests, type QuestFilter } from '@/features/quests/use-quests';
import { QuestCard } from './quest-card';
import { QuestCompletionModal } from './quest-completion-modal';
import { LevelUpModal } from '@/components/progression/level-up-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, fadeInUp } from '@/lib/motion';
import type { QuestCompletionResult } from '@/../src/shared/types/quest';

export function QuestList() {
  const {
    quests,
    allQuests,
    loading,
    error,
    filter,
    setFilter,
    completeQuest,
  } = useQuests();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [completingId, setCompletingId] = React.useState<string | null>(null);
  const [completionResult, setCompletionResult] = React.useState<QuestCompletionResult | null>(null);
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [levelUpData, setLevelUpData] = React.useState<{ open: boolean; newLevel: number; xp: number }>({
    open: false,
    newLevel: 1,
    xp: 0,
  });

  const handleComplete = async (questId: string) => {
    setCompletingId(questId);
    const res = await completeQuest(questId);
    setCompletingId(null);

    if (res.success && res.result) {
      setCompletionResult(res.result);
      setShowCompletionModal(true);
    }
  };

  const handleOpenLevelUp = (newLevel: number, xp: number) => {
    setLevelUpData({ open: true, newLevel, xp });
  };

  // Filter and search
  const displayedQuests = React.useMemo(() => {
    return quests.filter((q) => {
      if (!searchQuery) return true;
      const qLower = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(qLower) ||
        (q.description && q.description.toLowerCase().includes(qLower)) ||
        q.category.toLowerCase().includes(qLower)
      );
    });
  }, [quests, searchQuery]);

  const activeCount = allQuests.filter((q) => q.status === 'ACTIVE').length;
  const completedCount = allQuests.filter((q) => q.status === 'COMPLETED').length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Quest Board
          </h1>
          <Badge variant="rpg" size="sm">
            {activeCount} Active
          </Badge>
        </div>

        <Link href="/quests/create">
          <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Create Quest
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({allQuests.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search quests or categories..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quest Cards or State */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-surface space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedQuests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface-muted/40 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Your quest board is empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              {filter === 'COMPLETED'
                ? 'No quests completed yet. Finish an active quest to earn experience!'
                : 'Create your first real-life quest and begin your journey.'}
            </p>
          </div>
          {filter !== 'COMPLETED' && (
            <Link href="/quests/create">
              <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
                Create Your First Quest
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2.5"
        >
          {displayedQuests.map((quest) => (
            <motion.div key={quest.id} variants={fadeInUp}>
              <QuestCard
                quest={quest}
                onComplete={handleComplete}
                completing={completingId === quest.id}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Completion Modal */}
      <QuestCompletionModal
        open={showCompletionModal}
        result={completionResult}
        onClose={() => setShowCompletionModal(false)}
        onOpenLevelUp={handleOpenLevelUp}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        open={levelUpData.open}
        newLevel={levelUpData.newLevel}
        xpAwarded={levelUpData.xp}
        onClose={() => setLevelUpData((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
