'use client';

import * as React from 'react';
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
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { AVATAR_OPTIONS } from '@/lib/avatars';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  React.useEffect(() => {
    if (user && !character) {
      fetchCharacter(user.id);
    }
  }, [user, character, fetchCharacter]);

  const avatarInfo = AVATAR_OPTIONS.find((a) => a.id === character?.avatar) || AVATAR_OPTIONS[0];
  const AvatarIcon = AVATAR_ICONS[avatarInfo.iconName] || Shield;

  const charName = character?.name || 'Adventurer';

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Personalized Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-gradient-to-r from-surface to-surface-muted shadow-sm space-y-4">
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
                    Welcome, {charName}
                  </h2>
                  <Badge variant="rpg" size="sm">
                    Level 1
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Archetype: <span className="font-semibold text-foreground">{avatarInfo.name}</span> &bull; Focus:{' '}
                  <span className="font-semibold text-foreground capitalize">
                    {character?.lifeFocus || 'Learning'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="success" size="md">
                Account Active
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60">
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Your journey starts here. Character successfully created and authenticated.
            </p>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground flex items-start gap-3">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Phase 2 Scope Notice</p>
            <p className="mt-0.5">
              Authentication and character creation are fully active. Gameplay systems (quests, XP calculation, streaks, rewards, inventory, and skill trees) are non-functional placeholders reserved for subsequent phases.
            </p>
          </div>
        </div>

        {/* Future Gameplay System Placeholder Cards */}
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">
            Upcoming Gameplay Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quest Engine */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Swords className="h-5 w-5 text-indigo-500" />
                  <Badge variant="neutral" size="sm">
                    Phase 3
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Quests & Tasks</CardTitle>
                <CardDescription className="text-xs">
                  Real-life quest creation, completion validation, and daily challenges.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Streak & Multipliers */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <Badge variant="neutral" size="sm">
                    Phase 4
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Streaks & XP</CardTitle>
                <CardDescription className="text-xs">
                  Authoritative XP calculations, streak multipliers, and level thresholds.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Skill Tree */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <GitFork className="h-5 w-5 text-emerald-500" />
                  <Badge variant="neutral" size="sm">
                    Phase 5
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Skill Tree</CardTitle>
                <CardDescription className="text-xs">
                  Branching capability trees linked to real-world habits and productivity.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Rewards & Inventory */}
            <Card variant="muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Store className="h-5 w-5 text-purple-500" />
                  <Badge variant="neutral" size="sm">
                    Phase 6
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">Rewards & Shop</CardTitle>
                <CardDescription className="text-xs">
                  In-game economy, unlocking rewards, and inventory management.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
