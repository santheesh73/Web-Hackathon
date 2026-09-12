'use client';

import * as React from 'react';
import { Menu, Plus, Flame, Coins, ShieldCheck, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Dialog } from '@/components/ui/dialog';
import { getHealthStatus } from '@/lib/api';

export interface TopbarProps {
  onMobileMenuOpen: () => void;
  title?: string;
}

export function Topbar({ onMobileMenuOpen, title = 'Dashboard' }: TopbarProps) {
  const [apiConnected, setApiConnected] = React.useState<boolean | null>(null);
  const [isNewQuestOpen, setIsNewQuestOpen] = React.useState(false);

  React.useEffect(() => {
    getHealthStatus()
      .then((res) => {
        setApiConnected(!!res && res.status === 'ok');
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, []);

  return (
    <>
      <header className="h-16 border-b border-border/80 bg-surface/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Side: Quick Stats & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Health Connection Indicator */}
          <Tooltip
            content={
              apiConnected === true
                ? 'API Online (Fastify :4000)'
                : apiConnected === false
                ? 'API Disconnected'
                : 'Connecting to API...'
            }
          >
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-surface-muted/60 text-xs text-muted-foreground">
              {apiConnected ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-slate-700">API Live</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-medium text-slate-600">API Standby</span>
                </>
              )}
            </div>
          </Tooltip>

          {/* Streak Indicator (Visual Preview) */}
          <Tooltip content="14-Day Streak (Active)">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold cursor-default">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>14</span>
            </div>
          </Tooltip>

          {/* Gold / Currency Preview */}
          <Tooltip content="450 Gold Coins">
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-default">
              <Coins className="h-3.5 w-3.5 text-amber-500" />
              <span>450</span>
            </div>
          </Tooltip>

          {/* Quick Action Button Foundation */}
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewQuestOpen(true)}
          >
            <span className="hidden sm:inline">New Quest</span>
          </Button>
        </div>
      </header>

      {/* Demonstration Dialog for Quick Action */}
      <Dialog
        open={isNewQuestOpen}
        onOpenChange={setIsNewQuestOpen}
        title="Create New Quest"
        description="Phase 1 Foundation: Quest creation forms will be wired to the backend API in future phases."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-muted border border-border text-xs text-muted-foreground">
            Quest title, XP rewards, difficulty tags, and attribute links will be implemented in
            subsequent phases.
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNewQuestOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
