'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useCharacter } from '@/hooks/use-character';
import { useAchievements } from '@/features/achievements/use-achievements';
import { AchievementFilters } from '@/components/achievements/achievement-filters';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import { AchievementDetailModal } from '@/components/achievements/achievement-detail-modal';
import { AchievementCelebration } from '@/components/feedback/achievement-celebration';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import type { AchievementWithProgress } from '@/../src/shared/types/achievement';

export default function AchievementsPage() {
  const { character } = useCharacter();
  const {
    achievements,
    allAchievements,
    summary,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    newlyUnlocked,
    clearNewlyUnlocked,
  } = useAchievements();

  const [inspectingAchievement, setInspectingAchievement] = React.useState<AchievementWithProgress | null>(null);
  const [activeCelebration, setActiveCelebration] = React.useState<AchievementWithProgress | null>(null);

  React.useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const first = newlyUnlocked[0];
      const full = allAchievements.find((a) => a.id === first.id) || {
        ...first,
        progress: first.target,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
        progressPercent: 100,
      };
      setActiveCelebration(full);
      clearNewlyUnlocked();
    }
  }, [newlyUnlocked, allAchievements, clearNewlyUnlocked]);

  const handleInspect = (achievement: AchievementWithProgress) => {
    setInspectingAchievement(achievement);
  };

  return (
    <PageContainer>
      <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Achievements & Milestones
              </h1>
              <p className="text-xs text-muted-foreground">
                Honor badges and milestones earned through real-world quests and progression
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Quick Summary Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              {summary.unlockedCount} / {summary.total} Unlocked
            </span>
            <span className="text-[10px] text-muted-foreground ml-0.5">
              ({summary.completionPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {summary.inProgressCount} In Progress
            </span>
          </div>

          <Link href="/quests">
            <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl border-border/60 hover:border-primary/40 text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>Embark on Quests</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Progress Card */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-card/90 via-card/50 to-amber-950/10 p-6 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-3 h-3" /> Hall of Trophies
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {character?.name ? `${character.name}'s Accolades` : 'Heroic Milestones'}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every badge here is a permanent testament to your dedication. Complete quests, build streaks, defeat bosses, and equip powerful relics to unlock higher milestones.
            </p>
          </div>

          {/* Large Completion Gauge */}
          <div className="flex items-center gap-5 bg-background/50 border border-border/60 rounded-xl p-4 min-w-[240px]">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${summary.completionPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-foreground">
                {summary.completionPercent}%
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-muted-foreground">Progression</div>
              <div className="text-sm font-bold text-foreground">
                {summary.unlockedCount} of {summary.total} Completed
              </div>
              <div className="text-[11px] text-amber-500 font-medium">
                {summary.inProgressCount} in progress
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Filters and Controls */}
      <AchievementFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        summary={summary}
      />

      {/* Achievements Grid */}
      <AchievementGrid
        achievements={achievements}
        loading={loading}
        onSelect={handleInspect}
      />

      {/* Detail Inspection Modal */}
      <AchievementDetailModal
        achievement={inspectingAchievement}
        isOpen={Boolean(inspectingAchievement)}
        onClose={() => setInspectingAchievement(null)}
      />

      {/* Unlock Celebration Toast */}
      {activeCelebration && (
        <AchievementCelebration
          achievement={activeCelebration}
          onDismiss={() => setActiveCelebration(null)}
        />
      )}
      </div>
    </PageContainer>
  );
}
