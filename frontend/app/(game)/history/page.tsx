'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  History,
  Swords,
  Trophy,
  Coins,
  Flame,
  Calendar,
  Search,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { useQuests } from '@/features/quests/use-quests';
import { useShop } from '@/features/rewards/use-shop';
import { useAchievements } from '@/features/achievements/use-achievements';
import { useBossQuests } from '@/features/boss-quests/use-boss-quests';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type HistoryEventType = 'ALL' | 'QUESTS' | 'ACHIEVEMENTS' | 'PURCHASES' | 'BOSSES';

interface UnifiedHistoryEvent {
  id: string;
  type: 'QUEST' | 'ACHIEVEMENT' | 'TRANSACTION' | 'BOSS';
  title: string;
  subtitle: string;
  timestamp: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'accent' | 'success' | 'warning';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  xpDelta?: number;
  goldDelta?: number;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const { character } = useCharacter();
  const { allQuests, loading: questsLoading } = useQuests();
  const { transactions, loading: ecoLoading } = useShop();
  const { allAchievements, loading: achLoading } = useAchievements();
  const { bossQuests, loading: bossLoading } = useBossQuests();

  const [selectedFilter, setSelectedFilter] = React.useState<HistoryEventType>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const loading = questsLoading || ecoLoading || achLoading || bossLoading;

  // Aggregate and sort events
  const allEvents = React.useMemo<UnifiedHistoryEvent[]>(() => {
    const events: UnifiedHistoryEvent[] = [];

    // 1. Completed Quests
    allQuests
      .filter((q) => q.status === 'COMPLETED' && q.completedAt)
      .forEach((q) => {
        events.push({
          id: `quest-${q.id}`,
          type: 'QUEST',
          title: q.title,
          subtitle: `Conquered quest in ${q.category}`,
          timestamp: q.completedAt!,
          badgeText: `+${q.xpReward} XP`,
          badgeVariant: 'accent',
          icon: Swords,
          iconColor: 'text-indigo-500',
          iconBg: 'bg-indigo-500/10 border-indigo-500/20',
          xpDelta: q.xpReward,
        });
      });

    // 2. Unlocked Achievements
    allAchievements
      .filter((a) => a.isUnlocked && a.unlockedAt)
      .forEach((a) => {
        events.push({
          id: `ach-${a.id}`,
          type: 'ACHIEVEMENT',
          title: `Milestone: ${a.name}`,
          subtitle: a.description,
          timestamp: a.unlockedAt!,
          badgeText: 'Unlocked',
          badgeVariant: 'warning',
          icon: Trophy,
          iconColor: 'text-amber-500',
          iconBg: 'bg-amber-500/10 border-amber-500/20',
        });
      });

    // 3. Economy Transactions
    transactions.forEach((tx) => {
      const isEarn = tx.type === 'EARN';
      events.push({
        id: `tx-${tx.id}`,
        type: 'TRANSACTION',
        title: tx.description || (isEarn ? 'Gold Reward Acquired' : 'Marketplace Purchase'),
        subtitle: isEarn ? 'Reward gained' : 'Marketplace purchase',
        timestamp: tx.createdAt,
        badgeText: `${isEarn ? '+' : '-'}${tx.amount} Gold`,
        badgeVariant: isEarn ? 'success' : 'default',
        icon: Coins,
        iconColor: isEarn ? 'text-emerald-500' : 'text-amber-500',
        iconBg: isEarn ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20',
        goldDelta: isEarn ? tx.amount : -tx.amount,
      });
    });

    // 4. Defeated Bosses
    bossQuests
      .filter((b) => b.status === 'COMPLETED' && b.completedAt)
      .forEach((b) => {
        events.push({
          id: `boss-${b.id}`,
          type: 'BOSS',
          title: `Vanquished Boss: ${b.title}`,
          subtitle: `Epic challenge conquered (${b.difficulty} tier)`,
          timestamp: b.completedAt!,
          badgeText: `+${b.rewardXp || 250} XP`,
          badgeVariant: 'accent',
          icon: Flame,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-500/10 border-red-500/20',
          xpDelta: b.rewardXp,
        });
      });

    // Sort descending by timestamp
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allQuests, allAchievements, transactions, bossQuests]);

  // Filter and search
  const filteredEvents = React.useMemo(() => {
    return allEvents.filter((ev) => {
      if (selectedFilter === 'QUESTS' && ev.type !== 'QUEST') return false;
      if (selectedFilter === 'ACHIEVEMENTS' && ev.type !== 'ACHIEVEMENT') return false;
      if (selectedFilter === 'PURCHASES' && ev.type !== 'TRANSACTION') return false;
      if (selectedFilter === 'BOSSES' && ev.type !== 'BOSS') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return ev.title.toLowerCase().includes(q) || ev.subtitle.toLowerCase().includes(q);
      }

      return true;
    });
  }, [allEvents, selectedFilter, searchQuery]);

  const completedQuestsCount = allQuests.filter((q) => q.status === 'COMPLETED').length;
  const unlockedAchCount = allAchievements.filter((a) => a.isUnlocked).length;
  const totalGoldEarned = transactions
    .filter((t) => t.type === 'EARN')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Chronicle & Activity History
              </h1>
              <p className="text-xs text-muted-foreground">
                A permanent log of every quest conquered, accolade achieved, and relic forged
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Quick Summary Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Swords className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-foreground">
              {completedQuestsCount} Quests Conquered
            </span>
          </div>

          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              {unlockedAchCount} Accolades
            </span>
          </div>

          <div className="flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border/60 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Coins className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-foreground">
              {totalGoldEarned} Total Gold
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Events', count: allEvents.length },
            { id: 'QUESTS', label: 'Quests', count: completedQuestsCount },
            { id: 'ACHIEVEMENTS', label: 'Achievements', count: unlockedAchCount },
            { id: 'PURCHASES', label: 'Economy', count: transactions.length },
            { id: 'BOSSES', label: 'Bosses', count: bossQuests.filter((b) => b.status === 'COMPLETED').length },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as HistoryEventType)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chronicle..."
            className="pl-9 text-xs h-9 bg-card/60"
          />
        </div>
      </div>

      {/* Timeline Section */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse flex items-center gap-4 bg-card/40 border-border/40">
              <div className="w-10 h-10 rounded-xl bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-4 bg-muted/60 rounded" />
                <div className="w-1/2 h-3 bg-muted/40 rounded" />
              </div>
              <div className="w-16 h-4 bg-muted/40 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-border/70 bg-card/30 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-foreground">No Chronicle Records Found</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'No events match your current filter parameters. Try adjusting the search query or selecting All Events.'
                : 'Your chronicle awaits its first legend! Embark on quests, conquer tasks, defeat bosses, and build streaks to record your heroic deeds.'}
            </p>
          </div>
          <div className="pt-2">
            <Link href="/quests">
              <Button size="sm" variant="rpg" className="gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5" />
                <span>Begin First Quest</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="relative border-l-2 border-border/60 ml-4 md:ml-6 pl-6 md:pl-8 space-y-6">
          {filteredEvents.map((event, index) => {
            const Icon = event.icon;
            const dateStr = new Date(event.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                className="relative group"
              >
                {/* Timeline Node Point */}
                <div
                  className={cn(
                    'absolute -left-[35px] md:-left-[43px] top-3.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-transform group-hover:scale-110',
                    event.iconBg
                  )}
                >
                  <Icon className={cn('w-3 h-3', event.iconColor)} />
                </div>

                {/* Event Card */}
                <Card
                  variant="interactive"
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </h4>
                      {event.badgeText && (
                        <Badge
                          variant={
                            event.badgeVariant === 'accent'
                              ? 'rpg'
                              : event.badgeVariant === 'warning'
                              ? 'warning'
                              : event.badgeVariant === 'success'
                              ? 'success'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {event.badgeText}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{event.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                    <Calendar className="w-3 h-3 text-muted-foreground/60" />
                    <span>{dateStr}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
