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
  GitFork,
  Store,
  Backpack,
  Trophy,
  Zap,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeSelector } from '@/components/layout/ThemeSelector';
import { staggerContainer, fadeInUp, smoothTransition } from '@/lib/motion';
import { cn } from '@/lib/utils';

export default function MarketingPage() {
  const PILLARS = [
    {
      icon: Swords,
      title: 'Quests & Tasks',
      description: 'Convert real-world tasks, workouts, and study routines into quests with server-awarded XP.',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Sparkles,
      title: 'XP & Levels',
      description: 'Watch your character rank up deterministically through transparent, mathematically sound progression.',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: Flame,
      title: 'Streaks & Momentum',
      description: 'Build daily consistency anchored to UTC calendar days with emergency shield recovery.',
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: Shield,
      title: 'Attributes & Radar',
      description: 'Cultivate 6 holistic life disciplines: Strength, Intellect, Discipline, Wisdom, Creativity, and Resilience.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: GitFork,
      title: 'Branching Skill Tree',
      description: 'Spend earned Skill Points across specialized branches to unlock passive capability perks.',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Zap,
      title: 'Epic Boss Quests',
      description: 'Deconstruct intimidating milestones into linked multi-stage objectives with massive XP bounties.',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20',
    },
    {
      icon: Store,
      title: 'Gold & Rewards Shop',
      description: 'Earn gold by completing quests and spend it on avatar archetypes, UI themes, and cosmetic flair.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      icon: Backpack,
      title: 'Inventory & Equipment',
      description: 'Manage owned items, equip custom loadouts across 4 cosmetic slots, and customize your persona.',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      icon: Trophy,
      title: 'Achievements & Milestones',
      description: 'Unlock permanent honor accolades that chronicle your journey and celebrate your dedication.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-surface/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground block leading-tight">
                LIFE RPG
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                Productivity System
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeSelector />
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="rpg" className="text-xs gap-1.5 shadow-sm h-8 px-3">
                <span>Start</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 border-b border-border/60 bg-gradient-to-b from-surface to-background relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={smoothTransition}
            className="max-w-4xl mx-auto text-center space-y-5 relative z-10"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Life Productivity Reimagined</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.15]">
              What if your real life had an{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                RPG progression system?
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform everyday tasks, habits, and monumental goals into quests. Earn experience, build unbroken streaks, advance skill trees, vanquish bosses, and forge your personal legend.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/signup">
                <Button size="lg" variant="rpg" className="gap-2 text-xs sm:text-sm shadow-md h-10 px-5 sm:h-11 sm:px-6">
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-xs sm:text-sm h-10 px-5 sm:h-11 sm:px-6 border-border/70 hover:bg-card">
                  <span>Sign In & Resume</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 9 CORE PROGRESSION PILLARS */}
        <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <Badge variant="rpg" size="sm">
              Complete Feature Suite
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              A Complete RPG Engine for Real Life
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every system is server-authoritative, deterministic, and built to keep you motivated without gimmicks.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <motion.div key={pillar.title} variants={fadeInUp} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                  <Card
                    variant="interactive"
                    className="p-4 sm:p-5 h-full flex flex-col justify-between border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/40 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs', pillar.bgColor)}>
                        <Icon className={cn('w-4.5 h-4.5', pillar.color)} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {pillar.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 bg-surface border-t border-border/80">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ready to Level Up Your Real Life?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm">
              Create your character, embark on your first quest, and experience the satisfaction of seeing real-life progress reflected on your hero dashboard.
            </p>
            <div className="flex justify-center pt-1">
              <Link href="/signup">
                <Button size="lg" variant="rpg" className="gap-2 text-xs sm:text-sm shadow-md h-10 px-6 sm:h-11 sm:px-8">
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">LIFE RPG</span>
            <span>&bull;</span>
            <span>Web Hackathon Prototype</span>
          </div>
          <div>
            <span>Next.js 15 &bull; Fastify &bull; TypeScript &bull; Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
