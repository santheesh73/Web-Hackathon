'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

          <nav className="flex items-center gap-3 sm:gap-4">
            <ThemeSelector />
            <Link
              href="/login"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="rpg" className="text-xs font-semibold gap-1.5 shadow-sm h-9 px-4 rounded-xl">
                <span>Start Your Journey</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-border/60 bg-gradient-to-b from-surface via-background to-background relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[500px] h-[400px] bg-indigo-500/15 dark:bg-indigo-500/25 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* LEFT COLUMN: Eyebrow, Headline, Description, CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={smoothTransition}
                className="lg:col-span-7 text-center lg:text-left space-y-6"
              >
                {/* Eyebrow */}
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium shadow-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Real-Life Productivity Reimagined</span>
                  </div>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                  What if your real life had<br className="hidden sm:inline" />
                  {' '}an <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">RPG progression</span><br />
                  <span className="text-amber-500 font-black">system?</span>
                </h1>

                {/* Supporting description */}
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Transform everyday tasks, habits, and monumental goals into quests. Earn experience, build unbroken streaks, advance skill trees, vanquish bosses, and forge your personal legend.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link href="/signup">
                    <Button size="lg" variant="rpg" className="gap-2 text-sm font-semibold shadow-md h-11 px-7 rounded-xl">
                      <span>Start Your Journey</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="text-sm font-semibold h-11 px-7 rounded-xl border-border bg-surface hover:bg-surface-muted shadow-xs">
                      <span>Sign In & Resume</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* RIGHT COLUMN: Large Primary Visual + 3 Floating Badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="lg:col-span-5 relative flex items-center justify-center"
              >
                {/* Floating container */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] aspect-square flex items-center justify-center"
                >
                  {/* Outer Ambient Glow Ring */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-amber-500/20 blur-2xl -z-10" />

                  {/* Hero Visual Image */}
                  <div className="relative w-full h-full rounded-3xl overflow-hidden border border-indigo-500/20 dark:border-indigo-400/20 shadow-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 [mask-image:radial-gradient(circle_at_center,black_75%,transparent_100%)]">
                    <Image
                      src="/hero-adventurer.jpg"
                      alt="LIFE RPG Adventurer Hero Character on Level Progression Pedestal"
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 340px, (max-width: 1200px) 400px, 440px"
                    />
                  </div>

                  {/* Supporting Element 1 (Top-Left): Quest Completion & XP Gain */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    className="absolute -top-3 -left-2 sm:-left-6 z-20 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface/90 dark:bg-surface/95 backdrop-blur-md border border-border shadow-lg"
                  >
                    <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-foreground leading-tight">+150 XP Earned</div>
                      <div className="text-[9px] text-muted-foreground leading-tight">Quest Completed</div>
                    </div>
                  </motion.div>

                  {/* Supporting Element 2 (Bottom-Left): Level Indicator & Archetype */}
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                    className="absolute -bottom-3 -left-2 sm:-left-4 z-20 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface/90 dark:bg-surface/95 backdrop-blur-md border border-border shadow-lg"
                  >
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-foreground leading-tight">Level 12 Novice</div>
                      <div className="text-[9px] text-muted-foreground leading-tight">Discipline &bull; Rank II</div>
                    </div>
                  </motion.div>

                  {/* Supporting Element 3 (Bottom-Right): Consistency Streak */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute -bottom-3 -right-2 sm:-right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/90 dark:bg-surface/95 backdrop-blur-md border border-border shadow-lg"
                  >
                    <div className="h-7 w-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                      <Flame className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-foreground leading-tight">14 Day Streak</div>
                      <div className="text-[9px] text-amber-500 font-semibold leading-tight">2.0x Multiplier</div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
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
