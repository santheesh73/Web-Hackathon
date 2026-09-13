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
      <div className="h-14 flex items-center px-5 border-b border-border/70">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-foreground block leading-tight">
              LIFE RPG
            </span>
            <span className="text-[9px] font-semibold text-muted-foreground tracking-wider uppercase">
              Productivity RPG
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-4">
        {NAVIGATION_CONFIG.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-2.5 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              {group.group}
            </h4>
            <nav className="space-y-0.5 mt-1" aria-label={group.group}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
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
                          'text-[9px] font-bold px-1.5 py-0.2 rounded-full border leading-none',
                          item.badgeVariant === 'accent'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            : 'bg-surface-muted text-muted-foreground border-border'
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
      <div className="p-3 border-t border-border/70 bg-surface-muted/30">
        <Link href="/character" className="block group">
          <div className="flex items-center gap-2.5 p-2 rounded-xl border border-border bg-surface shadow-xs group-hover:border-primary/40 transition-colors">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-[8px] font-bold text-white px-1 py-0.2 rounded-full border border-surface">
                {displayLevel}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{displayName}</p>
                <Sparkles className="h-2.5 w-2.5 text-amber-500 shrink-0" />
              </div>
              <div className="flex items-center justify-between mt-0.5 text-[10px] text-muted-foreground">
                <span className="truncate max-w-[85px]">{displayTitle}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 text-[9px]">Lvl {displayLevel}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
