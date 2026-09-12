'use client';

import * as React from 'react';
import Link from 'next/link';
import { Flame, Plus, Trophy, Swords, Sparkles, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BossCard } from '@/components/boss/boss-card';
import { BossProgress } from '@/components/boss/boss-progress';
import { useBossQuests } from '@/features/boss-quests/use-boss-quests';

export default function BossQuestsPage() {
  const { bossQuests, activeBoss, loading, error, fetchBossQuests } = useBossQuests();
  const [tab, setTab] = React.useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');

  const activeBosses = bossQuests.filter((b) => b.status === 'ACTIVE');
  const completedBosses = bossQuests.filter((b) => b.status === 'COMPLETED');
  const displayedBosses = tab === 'ACTIVE' ? activeBosses : completedBosses;

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <Flame className="h-4 w-4 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Boss Quests
            </h1>
            <Badge variant="rpg" size="sm" className="hidden sm:inline-flex">
              Bounties
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Break large real-life ambitions into structured objectives and conquer monumental milestones.
          </p>
        </div>

        <Link href="/boss-quests/create">
          <Button variant="rpg" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Summon Boss Quest</span>
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchBossQuests()} className="h-7 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      ) : bossQuests.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 text-center p-12">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Flame className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">No active boss yet.</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Turn a major life project, examination, or career goal into an epic multi-stage Boss Battle.
              </p>
            </div>
            <Link href="/boss-quests/create">
              <Button variant="rpg" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Create Boss Quest</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured Active Boss Hero Banner */}
          {activeBoss && (
            <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm" className="gap-1 animate-pulse">
                      <Skull className="h-3 w-3" />
                      Active Boss Encounter
                    </Badge>
                    <Badge variant="rpg" size="sm">
                      {activeBoss.difficulty} Tier
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground pt-1">
                    {activeBoss.title}
                  </h2>
                  {activeBoss.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {activeBoss.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="rpg" size="md" className="gap-1.5 font-mono text-sm py-1.5 px-3">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>+{activeBoss.rewardXp} XP Bounty</span>
                  </Badge>
                  <Link href={`/boss-quests/${activeBoss.id}`}>
                    <Button variant="rpg" size="sm" className="gap-1 text-xs">
                      <span>Enter Battle</span>
                      <Swords className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Large Boss HP Gauge */}
              <div className="pt-2">
                <BossProgress
                  progressPercent={activeBoss.progressPercent}
                  totalObjectives={activeBoss.totalObjectivesCount}
                  completedObjectives={activeBoss.completedObjectivesCount}
                  difficulty={activeBoss.difficulty}
                  rewardXp={activeBoss.rewardXp}
                  isDefeated={activeBoss.isDefeated}
                  size="lg"
                />
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              onClick={() => setTab('ACTIVE')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                tab === 'ACTIVE'
                  ? 'bg-amber-500/10 text-amber-500 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active Encounters ({activeBosses.length})
            </button>
            <button
              onClick={() => setTab('COMPLETED')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                tab === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Defeated Bosses ({completedBosses.length})
            </button>
          </div>

          {/* Boss Quests Grid */}
          {displayedBosses.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {tab === 'ACTIVE'
                ? 'No active Boss Quests. Summon one to get started!'
                : 'No defeated Bosses yet. Complete all objectives to slay a Boss!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedBosses.map((boss) => (
                <BossCard key={boss.id} boss={boss} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
