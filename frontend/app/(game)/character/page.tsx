'use client';

import * as React from 'react';
import {
  User,
  Crown,
  Sparkles,
  Shield,
  Zap,
  GitFork,
  ArrowRight,
  BookOpen,
  Compass,
  Hammer,
  FlaskConical,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { useAttributes } from '@/features/attributes/use-attributes';
import { useSkillTree } from '@/features/skill-tree/use-skill-tree';
import { AttributeRadar } from '@/components/character/attribute-radar';
import { AttributeCard } from '@/components/character/attribute-card';
import { EvolutionBadge } from '@/components/character/evolution-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AVATAR_ICONS: Record<string, LucideIcon> = {
  warrior: Shield,
  scholar: BookOpen,
  scout: Compass,
  builder: Hammer,
  alchemist: FlaskConical,
  sentinel: Sparkles,
};

export default function CharacterPage() {
  const { user } = useAuth();
  const { character } = useCharacter();
  const { attributes, progress, evolution, loading: attrLoading } = useAttributes();
  const { treeData } = useSkillTree();

  const avatarKey = character?.avatar || 'warrior';
  const AvatarIcon = AVATAR_ICONS[avatarKey.toLowerCase()] || Shield;

  const unlockedSkills = React.useMemo(() => {
    if (!treeData) return [];
    const unlocked: any[] = [];
    for (const b of treeData.branches) {
      for (const s of b.skills) {
        if (s.isUnlocked) unlocked.push(s);
      }
    }
    return unlocked;
  }, [treeData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Character Header Banner */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/30 to-card shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl border flex items-center justify-center bg-background shadow-md ${
                evolution?.auraClass || ''
              }`}
            >
              <AvatarIcon className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {character?.name || 'Adventurer'}
                </h1>
                <Badge variant="rpg" size="sm">
                  Lvl {character?.level || 1}
                </Badge>
              </div>

              {evolution && (
                <EvolutionBadge evolution={evolution} size="sm" showProgress={false} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="px-3.5 py-2 rounded-xl border border-border bg-background text-right">
              <div className="text-[10px] uppercase font-mono text-muted-foreground">
                Skill Points
              </div>
              <div className="text-base font-extrabold text-foreground flex items-center gap-1 justify-end">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                {character?.skillPoints ?? treeData?.availableSkillPoints ?? 0} SP
              </div>
            </div>

            <Link href="/skill-tree">
              <Button variant="rpg" size="sm" className="gap-1.5">
                <GitFork className="h-3.5 w-3.5" />
                Skill Tree
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar & Attributes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attribute Radar & Evolution Progress */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart Card */}
          <Card variant="default">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attribute Balance</CardTitle>
              <CardDescription className="text-xs">
                Polygonal distribution across all 6 lifestyle categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex justify-center">
              {attrLoading ? (
                <div className="w-[280px] h-[280px] rounded-full bg-muted/40 animate-pulse" />
              ) : (
                <AttributeRadar attributes={attributes} size={280} />
              )}
            </CardContent>
          </Card>

          {/* Evolution Requirements Card */}
          {evolution && (
            <Card variant="interactive">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-sm">Ascension Path</CardTitle>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Tier {evolution.tier} of 4
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {evolution.nextTier
                    ? `Requirements to achieve Tier ${evolution.nextTier.tier} Ascension:`
                    : 'Maximum Ascension Rank Achieved!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {evolution.nextTier ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 border border-border/60">
                      <span>Overall Level {evolution.nextTier.minLevel}+</span>
                      <Badge
                        variant={evolution.nextTier.levelMet ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {character?.level || 1} / {evolution.nextTier.minLevel}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 border border-border/60">
                      <span>Mastered Skills {evolution.nextTier.minSkills}+</span>
                      <Badge
                        variant={evolution.nextTier.skillsMet ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {unlockedSkills.length} / {evolution.nextTier.minSkills}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 border border-border/60">
                      <span>Highest Attribute Level {evolution.nextTier.minAttributeLevel}+</span>
                      <Badge
                        variant={evolution.nextTier.attributesMet ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {Math.max(...attributes.map((a) => a.level), 1)} /{' '}
                        {evolution.nextTier.minAttributeLevel}
                      </Badge>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Ascension Readiness</span>
                        <span>{evolution.nextTier.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${evolution.nextTier.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs">
                    You have ascended to the absolute peak of character progression!
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: 6 Attribute Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground tracking-tight">
              Character Attributes
            </h3>
            <span className="text-xs text-muted-foreground">
              {attributes.length} Disciplines Tracked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {attributes.map((attr) => (
              <AttributeCard
                key={attr.id || attr.attributeKey}
                attribute={attr}
                progress={progress[attr.attributeKey]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unlocked Capabilities Summary */}
      <Card variant="default">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Mastered Capabilities</CardTitle>
              <CardDescription className="text-xs">
                Active passive perks attuned from the skill tree.
              </CardDescription>
            </div>
            <Link href="/skill-tree">
              <Button variant="outline" size="sm" className="text-xs">
                View Full Tree
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {unlockedSkills.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
              No capabilities unlocked yet. Level up your character and attributes to earn Skill Points, then attune skills in the Skill Tree!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {unlockedSkills.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-border/80 bg-muted/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{s.title}</span>
                    <Badge variant="neutral" size="sm" className="text-[9px] font-mono">
                      {s.attributeKey}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{s.perkEffect}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
