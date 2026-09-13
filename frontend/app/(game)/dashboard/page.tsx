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
  Backpack,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { useQuests } from '@/features/quests/use-quests';
import { useQuestChains } from '@/features/quest-chains/use-quest-chains';
import { useStreak } from '@/features/streak/use-streak';
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
import { useBossQuests } from '@/features/boss-quests/use-boss-quests';
import { BossCard } from '@/components/boss/boss-card';
import { CurrencyDisplay } from '@/components/economy/currency-display';
import { AchievementSummary } from '@/components/achievements/achievement-summary';

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
  const { streak } = useStreak();
  const { evolution } = useAttributes();
  const { treeData } = useSkillTree();
  const { activeBoss, bossQuests } = useBossQuests();

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
    <PageContainer size="lg">
      <div className="space-y-5">
        {/* 1. Personalized Hero Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border bg-gradient-to-r from-surface via-surface to-surface-muted shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div
                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${avatarInfo.color} flex items-center justify-center text-white shadow-sm shrink-0`}
              >
                <AvatarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {charName}
                  </h2>
                  <Badge variant="rpg" size="sm">
                    Lvl {charLevel}
                  </Badge>
                  {evolution && (
                    <EvolutionBadge evolution={evolution} size="sm" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {avatarInfo.name} Archetype
                  <span className="mx-1.5 text-border">&bull;</span>
                  <span className="capitalize">{character?.lifeFocus || 'Productivity'}</span> Focus
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/quests/create">
                <Button variant="rpg" size="sm" className="gap-1.5 shadow-xs text-xs">
                  <PlusCircle className="h-3.5 w-3.5" /> New Quest
                </Button>
              </Link>
              <Link href="/quests">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Swords className="h-3.5 w-3.5" /> Quests
                </Button>
              </Link>
            </div>
          </div>

          {/* Unified Primary XP Bar */}
          <div className="pt-2 border-t border-border/60">
            <XPBar xp={charXp} showDetails />
          </div>

          {/* Actionable Directive: Compact Single-Line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-primary/5 border border-primary/15 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground shrink-0">Next Goal:</span>
              <span className="text-muted-foreground truncate">
                {activeQuests.length > 0
                  ? `"${activeQuests[0].title}" (+${activeQuests[0].xpReward} XP)`
                  : activeBoss
                  ? `Battle "${activeBoss.title}"`
                  : 'Embark on your first quest to earn XP!'}
              </span>
            </div>
            <Link
              href={
                activeQuests.length > 0
                  ? `/quests/${activeQuests[0].id}`
                  : activeBoss
                  ? `/boss-quests`
                  : '/quests/create'
              }
              className="shrink-0 self-end sm:self-auto font-semibold text-primary hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              <span>{activeQuests.length > 0 ? 'Conquer' : activeBoss ? 'Battle' : 'Start'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2. Live HUD Overview Metrics */}
        <ProgressionSummary
          xp={charXp}
          level={charLevel}
          activeQuestsCount={activeQuests.length}
          completedQuestsCount={completedQuests.length}
          streakDays={streak?.currentStreak ?? 0}
          availableSp={treeData?.availableSkillPoints ?? 0}
        />

        {/* 3. Balanced 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Main Adventure Canvas */}
          <div className="lg:col-span-8 space-y-5">
            {/* Active & Recent Quests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Swords className="h-4.5 w-4.5 text-primary" /> Active Quests
                </h3>
                <Link
                  href="/quests"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  View all ({allQuests.length}) <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {questsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-28 rounded-xl bg-surface-muted animate-pulse border border-border" />
                  <div className="h-28 rounded-xl bg-surface-muted animate-pulse border border-border" />
                </div>
              ) : recentQuests.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2 border-border bg-surface/50 space-y-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Swords className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">No Quests Embarked Yet</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-0.5">
                      Turn your workouts, study sessions, reading, and healthy habits into XP.
                    </p>
                  </div>
                  <div className="pt-1">
                    <Link href="/quests/create">
                      <Button variant="rpg" size="sm" className="gap-1.5">
                        <PlusCircle className="h-4 w-4" /> Create First Quest
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Active Quest Chains */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-primary" /> Quest Chains
                </h3>
                <Link
                  href="/quests/chains"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  View all ({chains.length}) <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {chainsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-32 rounded-xl bg-surface-muted animate-pulse border border-border" />
                  <div className="h-32 rounded-xl bg-surface-muted animate-pulse border border-border" />
                </div>
              ) : activeChains.length === 0 ? (
                <Card className="p-5 text-center border-dashed border-2 border-border bg-surface/40 space-y-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">No Active Quest Chains</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-0.5">
                      Break a major project into sequential steps with automatic progression.
                    </p>
                  </div>
                  <div className="pt-0.5">
                    <Link href="/quests/chains/create">
                      <Button variant="rpg" size="sm" className="gap-1.5 text-xs">
                        <PlusCircle className="h-3.5 w-3.5" /> Create Chain
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeChains.slice(0, 2).map((chain) => (
                    <QuestChainCard key={chain.id} chain={chain} />
                  ))}
                </div>
              )}
            </div>

            {/* Boss Quests System */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Flame className="h-4.5 w-4.5 text-red-500" /> Boss Encounters
                </h3>
                <Link
                  href="/boss-quests"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  View all ({bossQuests.length}) <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {activeBoss ? (
                <BossCard boss={activeBoss} />
              ) : (
                <Card variant="muted" className="p-6 text-center border-dashed border">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      No active Boss Battles underway. Transform a monumental goal into an epic challenge!
                    </p>
                    <Link href="/boss-quests/create">
                      <Button variant="outline" size="sm" className="gap-1 text-xs mt-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        <span>Summon a Boss Quest</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Progression & Companion Hub (Streak, Mastery, Milestones, Shop) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Daily Consistency (Streak & Calendar) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" /> Consistency Tracker
                </h3>
              </div>
              <StreakCard />
              <StreakCalendar days={28} />
            </div>

            {/* Character & Capability Progression */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-red-500" /> Character Mastery
                </h3>
              </div>

              <div className="space-y-2.5">
                <Link href="/character" className="block">
                  <Card variant="interactive" className="p-3.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm group-hover:text-primary transition-colors">
                            Character Sheet
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">
                            6 disciplines & radar chart
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </Card>
                </Link>

                <Link href="/skill-tree" className="block">
                  <Card variant="interactive" className="p-3.5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <GitFork className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm group-hover:text-primary transition-colors">
                            Branching Skill Tree
                          </CardTitle>
                          <p className="text-[11px] text-muted-foreground">
                            Attune passive capability perks
                          </p>
                        </div>
                      </div>
                      <Badge variant="rpg" size="sm">
                        {treeData?.availableSkillPoints ?? 0} SP
                      </Badge>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Achievements & Milestones Recognition */}
            <div className="space-y-3">
              <AchievementSummary />
            </div>

            {/* Economy & Equipment Hub */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-amber-500" /> Marketplace & Gear
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/shop" className="block">
                  <Card variant="interactive" className="p-3.5 group h-full flex flex-col justify-between border-amber-500/20 hover:border-amber-500/50">
                    <div className="space-y-1.5">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        Rewards Shop
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground pt-2 flex items-center justify-between font-medium">
                      Spend Gold &rarr;
                    </span>
                  </Card>
                </Link>

                <Link href="/inventory" className="block">
                  <Card variant="interactive" className="p-3.5 group h-full flex flex-col justify-between border-emerald-500/20 hover:border-emerald-500/50">
                    <div className="space-y-1.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Backpack className="h-4 w-4" />
                      </div>
                      <div className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        Inventory
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground pt-2 flex items-center justify-between font-medium">
                      Equip Gear &rarr;
                    </span>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
