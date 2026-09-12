'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Swords,
  Flame,
  GitFork,
  Store,
  Shield,
  BookOpen,
  Compass,
  Hammer,
  FlaskConical,
  LucideIcon,
  CheckCircle2,
  Clock,
  PlusCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { useQuests } from '@/features/quests/use-quests';
import { useQuestChains } from '@/features/quest-chains/use-quest-chains';
import { AVATAR_OPTIONS } from '@/lib/avatars';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XPBar } from '@/components/progression/xp-bar';
import { ProgressionSummary } from '@/components/progression/progression-summary';
import { QuestCategoryBadge } from '@/components/quests/quest-category';
import { StreakCard } from '@/components/streak/streak-card';
import { StreakCalendar } from '@/components/streak/streak-calendar';
import { QuestChainCard } from '@/components/quests/quest-chain-card';
import { useAttributes } from '@/features/attributes/use-attributes';
import { useSkillTree } from '@/features/skill-tree/use-skill-tree';
import { EvolutionBadge } from '@/components/character/evolution-badge';

const AVATAR_ICONS: Record<string, LucideIcon> = {
  Shield,
  BookOpen,
  Compass,
  Hammer,
  FlaskConical,
  Sparkles,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { character, fetchCharacter } = useCharacter();
  const { allQuests, loading: questsLoading } = useQuests();
  const { chains, loading: chainsLoading } = useQuestChains();
  const { evolution } = useAttributes();
  const { treeData } = useSkillTree();

  React.useEffect(() => {
    if (user && !character) {
      fetchCharacter(user.id);
    }
  }, [user, character, fetchCharacter]);

  const avatarInfo = AVATAR_OPTIONS.find((a) => a.id === character?.avatar) || AVATAR_OPTIONS[0];
  const AvatarIcon = AVATAR_ICONS[avatarInfo.iconName] || Shield;

  const charName = character?.name || 'Adventurer';
  const charLevel = character?.level || 1;
  const charXp = character?.xp || 0;

  const activeQuests = allQuests.filter((q) => q.status === 'ACTIVE');
  const completedQuests = allQuests.filter((q) => q.status === 'COMPLETED');
  const recentQuests = [...allQuests].slice(0, 4);

  const activeChains = chains.filter((c) => c.status === 'ACTIVE');

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* 1. Personalized Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-gradient-to-r from-surface to-surface-muted shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${avatarInfo.color} flex items-center justify-center text-white shadow-md`}
              >
                <AvatarIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, {charName}
                  </h2>
                  <Badge variant="rpg" size="sm">
                    Level {charLevel}
                  </Badge>
                </div>
                {evolution && (
                  <div className="mt-1">
                    <EvolutionBadge evolution={evolution} size="sm" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Archetype: <span className="font-semibold text-foreground">{avatarInfo.name}</span> &bull; Focus:{' '}
                  <span className="font-semibold text-foreground capitalize">
                    {character?.lifeFocus || 'Learning'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/quests/create">
                <Button variant="rpg" size="sm" className="gap-1.5 shadow-sm">
                  <PlusCircle className="h-4 w-4" /> New Quest
                </Button>
              </Link>
              <Link href="/quests">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Swords className="h-4 w-4" /> Quest Board
                </Button>
              </Link>
            </div>
          </div>

          {/* XP Bar in Banner */}
          <div className="pt-4 border-t border-border/60">
            <XPBar xp={charXp} showDetails />
          </div>
        </div>

        {/* 2. Live Progression Overview Metrics */}
        <ProgressionSummary
          xp={charXp}
          level={charLevel}
          activeQuestsCount={activeQuests.length}
          completedQuestsCount={completedQuests.length}
        />

        {/* 3. Streak & Consistency Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <StreakCard className="h-full" />
          </div>
          <div className="lg:col-span-2">
            <StreakCalendar days={28} className="h-full" />
          </div>
        </div>

        {/* 4. Active Quest Chains Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Active Quest Chains
              </h3>
              <p className="text-xs text-muted-foreground">
                Sequential long-term roadmaps to conquer ambitious real-world goals.
              </p>
            </div>
            <Link
              href="/quests/chains"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all chains ({chains.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {chainsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-border" />
              <div className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-border" />
            </div>
          ) : activeChains.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-2 border-border bg-surface/40 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm">No Active Quest Chains</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-0.5">
                  Break a major life project into a sequence of ordered steps with automatic unlocking.
                </p>
              </div>
              <div className="pt-1">
                <Link href="/quests/chains/create">
                  <Button variant="rpg" size="sm" className="gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5" /> Create Quest Chain
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChains.slice(0, 2).map((chain) => (
                <QuestChainCard key={chain.id} chain={chain} />
              ))}
            </div>
          )}
        </div>

        {/* 5. Active & Recent Quests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" /> Active & Recent Quests
              </h3>
              <p className="text-xs text-muted-foreground">
                Conquer real-life actions to gain experience and raise your hero rank.
              </p>
            </div>
            <Link
              href="/quests"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all ({allQuests.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {questsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-28 rounded-xl bg-slate-100 animate-pulse border border-border" />
              <div className="h-28 rounded-xl bg-slate-100 animate-pulse border border-border" />
            </div>
          ) : recentQuests.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-border bg-surface/50 space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Swords className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-foreground">No Quests Embarked Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Turn your daily tasks, workouts, study sessions, and habits into XP.
              </p>
              <div className="pt-2">
                <Link href="/quests/create">
                  <Button variant="rpg" size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" /> Create First Quest
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentQuests.map((q) => (
                <Link key={q.id} href={`/quests/${q.id}`}>
                  <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col justify-between group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <QuestCategoryBadge category={q.category} size="sm" />
                        {q.status === 'COMPLETED' ? (
                          <Badge variant="success" size="sm" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="rpg" size="sm" className="gap-1">
                            <Sparkles className="h-3 w-3" /> +{q.xpReward} XP
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {q.title}
                      </h4>
                      {q.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {q.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {q.dueDate
                          ? `Due ${new Date(q.dueDate).toLocaleDateString()}`
                          : 'No due date'}
                      </span>
                      <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Details &rarr;
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 6. Character Progression & Capability Attunement */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Character & Capability Progression
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Phase 5 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/character">
              <Card variant="interactive" className="h-full group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        <Shield className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        Character Sheet & Attributes
                      </CardTitle>
                    </div>
                    <Badge variant="rpg" size="sm">
                      View
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Inspect your 6 lifestyle disciplines, polygonal attribute radar, and ascension path.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/skill-tree">
              <Card variant="interactive" className="h-full group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <GitFork className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        Branching Skill Tree
                      </CardTitle>
                    </div>
                    <Badge variant="rpg" size="sm">
                      {treeData?.availableSkillPoints ?? 0} SP Available
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Attune passive capability multipliers and specialize across your attribute branches.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* 7. Future Expansion Modules Preview */}
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">
            Upcoming Expansion Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Boss Quests */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <Badge variant="neutral" size="sm">
                    Upcoming
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Boss Milestone Battles</CardTitle>
                <CardDescription className="text-xs">
                  Multi-stage epic challenges, countdown deadlines, and massive XP bounties.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Rewards & Shop */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Store className="h-5 w-5 text-purple-500" />
                  <Badge variant="neutral" size="sm">
                    Phase 6
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Shop & Inventory</CardTitle>
                <CardDescription className="text-xs">
                  Real-world reward redemption, gold economy, and cosmetic unlocks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
