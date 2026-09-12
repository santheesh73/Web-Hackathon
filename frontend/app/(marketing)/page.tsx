'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  Swords,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground block leading-tight">
                LIFE RPG
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Productivity System
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                Launch App
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-b border-border/60 bg-gradient-to-b from-surface to-background">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transform Real Life into an RPG Adventure</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              Turn real-life goals into quests.{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                Level up your life.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Gamify your habits, defeat procrastination, and build meaningful streaks with a
              modern, server-authoritative progression platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="lg" variant="primary" icon={<Swords className="h-5 w-5" />}>
                  Launch App Shell
                </Button>
              </Link>
              <a href="#explanation">
                <Button size="lg" variant="outline">
                  Explore Concept
                </Button>
              </a>
            </div>

            {/* PRODUCT VISUAL PREVIEW (Static Mock UI Composition) */}
            <div className="pt-10 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-border bg-surface shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden">
                {/* Visual Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                      LV 7
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">Adventurer</span>
                        <Badge variant="rpg" size="sm">
                          Novice II
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Class: Disciplined Scholar</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                      <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span>14-Day Streak</span>
                    </div>
                    <Badge variant="default" size="sm">
                      Fastify Verified
                    </Badge>
                  </div>
                </div>

                {/* Level Progress Bar */}
                <div className="py-4 border-b border-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Experience to Level 8</span>
                    <span className="font-bold text-amber-600">680 / 1000 XP</span>
                  </div>
                  <Progress value={680} max={1000} variant="accent" size="md" />
                </div>

                {/* Sample Active Quests */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Active Daily Quests (Preview)</span>
                    <span>Reward</span>
                  </div>

                  {/* Mock Quest 1 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-md border-2 border-primary/40 flex items-center justify-center text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Deep Work Sprint: 90 Minutes Focus
                        </p>
                        <p className="text-xs text-muted-foreground">Productivity &bull; +2 INT</p>
                      </div>
                    </div>
                    <Badge variant="rpg" size="sm">
                      +120 XP
                    </Badge>
                  </div>

                  {/* Mock Quest 2 */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-md border-2 border-slate-300" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Morning Workout & Mobility Circuit
                        </p>
                        <p className="text-xs text-muted-foreground">Fitness &bull; +2 STR</p>
                      </div>
                    </div>
                    <Badge variant="rpg" size="sm">
                      +80 XP
                    </Badge>
                  </div>
                </div>

                {/* Subtitle disclaimer */}
                <div className="mt-4 pt-3 border-t border-border/60 text-center">
                  <p className="text-[11px] text-muted-foreground">
                    Static demonstration preview &bull; Phase 1 Visual Architecture
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHORT PRODUCT EXPLANATION SECTION */}
        <section id="explanation" className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Built for Sustainable Momentum
            </h2>
            <p className="text-sm text-muted-foreground">
              A disciplined blend of real-world productivity principles and engaging RPG metaphors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-2">
                  <Swords className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Real-World Quests</CardTitle>
                <CardDescription>
                  Transform tasks, habits, and projects into structured quests with explicit XP
                  rewards and attribute growth.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Pillar 2 */}
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
                  <Lock className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Authoritative Progress</CardTitle>
                <CardDescription>
                  Server-verified progression logic ensures XP, streaks, and levels maintain
                  integrity and tangible meaning.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Pillar 3 */}
            <Card>
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                  <Flame className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Boss Battles & Streaks</CardTitle>
                <CardDescription>
                  Tackle high-resistance challenges and maintain streak chains to earn milestone
                  achievements and rewards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CORE CONCEPT PREVIEW */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 bg-surface border-y border-border/80">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Badge variant="default" size="sm">
                System Foundations
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Architected for Hackathon Excellence
              </h2>
              <p className="text-sm text-muted-foreground">
                Modular full-stack engineering with clean separation of presentation and logic.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-foreground">Next.js 15 App Router</h3>
                <p className="text-xs text-muted-foreground">
                  Modern React 19 server components and client interaction shells.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <Cpu className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-sm text-foreground">Fastify Backend</h3>
                <p className="text-xs text-muted-foreground">
                  High-throughput, type-safe API with Zod contract validation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-foreground">Supabase Database</h3>
                <p className="text-xs text-muted-foreground">
                  PostgreSQL foundation ready for auth, tables, and RLS security.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background space-y-2">
                <Sparkles className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-sm text-foreground">Shared Contracts</h3>
                <p className="text-xs text-muted-foreground">
                  Zero model duplication via shared TypeScript definitions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SIMPLE CALL TO ACTION */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Experience the Phase 1 Application Shell
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Explore the responsive navigation shell, design primitives, and interface layout
            engineered for future gameplay expansion.
          </p>
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                Launch Application Shell
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">LIFE RPG</span>
            <span>&bull;</span>
            <span>Web Hackathon Project</span>
          </div>
          <div>
            <span>Next.js &bull; Fastify &bull; TypeScript &bull; Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
