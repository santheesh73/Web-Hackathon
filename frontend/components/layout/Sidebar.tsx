'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Sparkles } from 'lucide-react';
import { NAVIGATION_CONFIG } from '@/lib/navigation';
import { Badge } from '@/components/ui/badge';
import { useCharacter } from '@/hooks/use-character';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  characterName?: string;
}

export function Sidebar({ characterName = 'Adventurer' }: SidebarProps) {
  const pathname = usePathname();
  const { character } = useCharacter();

  const displayName = character?.name || characterName || 'Adventurer';
  const displayLevel = character?.level ?? 1;
  const displayTitle = character?.evolutionTitle || 'Novice Adventurer';

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border/70">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-foreground block leading-tight">
              LIFE RPG
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
              Productivity RPG
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {NAVIGATION_CONFIG.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {group.group}
            </h4>
            <nav className="space-y-0.5 mt-1.5" aria-label={group.group}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none',
                          item.badgeVariant === 'accent'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Character Profile Foundation (Active Character Summary) */}
      <div className="p-4 border-t border-border/70 bg-surface-muted/50">
        <Link href="/character" className="block group">
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-surface shadow-subtle group-hover:border-primary/40 transition-colors">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[9px] font-bold text-white px-1 py-0.2 rounded-full border border-white dark:border-slate-900">
                {displayLevel}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{displayName}</p>
                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                <span className="truncate max-w-[90px]">{displayTitle}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Level {displayLevel}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
