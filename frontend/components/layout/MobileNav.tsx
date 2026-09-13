'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { NAVIGATION_CONFIG } from '@/lib/navigation';
import { Badge } from '@/components/ui/badge';
import { useCharacter } from '@/hooks/use-character';
import { cn } from '@/lib/utils';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { character } = useCharacter();

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on route change
  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-overlay/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-surface border-r border-border p-5 flex flex-col shadow-2xl z-50 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm tracking-tight text-foreground">LIFE RPG</span>
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {NAVIGATION_CONFIG.map((group) => (
                <div key={group.group} className="space-y-1">
                  <h4 className="px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
                          onClick={onClose}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <Badge variant="rpg" size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Profile footer */}
            <div className="pt-3 border-t border-border/70 text-xs text-muted-foreground">
              <Link href="/character" onClick={onClose} className="flex items-center justify-between hover:text-foreground transition-colors">
                <span className="truncate max-w-[140px]">Character: {character?.name || 'Adventurer'}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">Level {character?.level ?? 1}</span>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
