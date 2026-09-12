'use client';

import * as React from 'react';
import {
  Flame,
  Swords,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome back, Adventurer
              </h2>
              <Badge variant="rpg" size="sm">
                Rank: Novice II
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Phase 1 Design Foundation — Preview of layout and design primitives.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              View History
            </Button>
            <Button variant="primary" size="sm" icon={<Swords className="h-4 w-4" />}>
              Active Quests
            </Button>
          </div>
        </div>

        {/* Top Progression Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Level & XP */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Character Level</CardDescription>
                <Badge variant="default" size="sm">
                  Tier 1
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                Level 7
                <Sparkles className="h-4 w-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={680}
                max={1000}
                variant="accent"
                size="sm"
                label="680 / 1000 XP"
                showValue
              />
            </CardContent>
          </Card>

          {/* Active Streak */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Daily Streak</CardDescription>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                14 Days
                <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Next milestone: <span className="font-semibold text-foreground">21 Days</span> (+100 XP)
              </p>
            </CardContent>
          </Card>

          {/* Active Quests */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Active Quests</CardDescription>
                <Badge variant="rpg" size="sm">
                  3 In Progress
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">3 / 5</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Daily completion: <span className="font-semibold text-emerald-600">60%</span>
              </p>
            </CardContent>
          </Card>

          {/* Boss Quest Readiness */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Boss Battle</CardDescription>
                <Badge variant="warning" size="sm">
                  Approaching
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Procrastination</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={4} max={7} variant="primary" size="sm" label="4 / 7 Quests" showValue />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections: Active Quests + Attributes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Quests Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  Today&apos;s Active Quests
                </h3>
                <p className="text-xs text-muted-foreground">
                  Demonstration of interactive quest card primitives.
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                3 Total
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Quest 1 */}
              <Card variant="interactive">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info" size="sm">
                          Focus
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 90 min
                        </span>
                      </div>
                      <CardTitle className="text-base">Deep Work Sprint: System Architecture</CardTitle>
                      <CardDescription>
                        Complete modular design documentation without distractions.
                      </CardDescription>
                    </div>
                    <Badge variant="rpg" size="sm">
                      +120 XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span className="font-medium text-indigo-600">Attribute: +2 INT</span>
                  <Button variant="outline" size="sm">
                    Mark Done
                  </Button>
                </CardFooter>
              </Card>

              {/* Quest 2 */}
              <Card variant="interactive">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="success" size="sm">
                          Fitness
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 45 min
                        </span>
                      </div>
                      <CardTitle className="text-base">Morning Strength & Mobility</CardTitle>
                      <CardDescription>
                        Bodyweight training circuit and full-body stretch routine.
                      </CardDescription>
                    </div>
                    <Badge variant="rpg" size="sm">
                      +80 XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span className="font-medium text-emerald-600">Attribute: +2 STR</span>
                  <Button variant="outline" size="sm">
                    Mark Done
                  </Button>
                </CardFooter>
              </Card>

              {/* Quest 3 */}
              <Card variant="interactive">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" size="sm">
                          Habit
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 30 min
                        </span>
                      </div>
                      <CardTitle className="text-base">Read 20 Pages of Educational Material</CardTitle>
                      <CardDescription>
                        Expand mental models and reflect on key concepts.
                      </CardDescription>
                    </div>
                    <Badge variant="rpg" size="sm">
                      +50 XP
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-0 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span className="font-medium text-amber-600">Attribute: +1 WIS</span>
                  <Button variant="outline" size="sm">
                    Mark Done
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Side Column: Character Attributes & Progression preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">Attributes</h3>
              <p className="text-xs text-muted-foreground">Progression metric visual tokens.</p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Character Attributes</CardTitle>
                <CardDescription>Level 7 Balanced Build</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={75} max={100} variant="primary" label="Intelligence (INT)" showValue />
                <Progress value={60} max={100} variant="success" label="Strength (STR)" showValue />
                <Progress value={70} max={100} variant="accent" label="Wisdom (WIS)" showValue />
                <Progress value={50} max={100} variant="danger" label="Constitution (CON)" showValue />
              </CardContent>
            </Card>

            {/* Design System Information Card */}
            <Card variant="muted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Phase 1 Foundation</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  All components use semantic design tokens, light-first typography, and accessible primitives. Authoritative calculations will be driven by the Fastify backend in subsequent phases.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
