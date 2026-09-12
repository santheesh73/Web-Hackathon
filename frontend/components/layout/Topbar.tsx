'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Plus, Flame, Coins, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Dialog } from '@/components/ui/dialog';
import { getHealthStatus } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { CurrencyDisplay } from '@/components/economy/currency-display';
import Link from 'next/link';

export interface TopbarProps {
  onMobileMenuOpen: () => void;
  title?: string;
  characterName?: string;
}

export function Topbar({ onMobileMenuOpen, title = 'Dashboard', characterName }: TopbarProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const { character } = useCharacter();
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 border-b border-border/80 bg-surface/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Button & Page Title */}
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

        {/* Right: Status Indicators & Quick Actions */}
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

          {/* Gold Balance Indicator */}
          <Link href="/shop" className="hover:opacity-90 transition-opacity">
            <CurrencyDisplay amount={character?.gold ?? 0} size="sm" />
          </Link>


          {/* Quick Action Button */}
          <Button
            size="sm"
            variant="outline"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewQuestOpen(true)}
          >
            <span className="hidden sm:inline">New Quest</span>
          </Button>

          {/* Sign Out Action */}
          <Tooltip content="Sign Out">
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Demonstration Dialog for Quick Action */}
      <Dialog
        open={isNewQuestOpen}
        onOpenChange={setIsNewQuestOpen}
        title="Quests Coming Soon"
        description="Phase 2 Foundation: Real quest creation and management will be introduced in subsequent phases."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-surface-muted border border-border text-xs text-muted-foreground">
            Quests will be fully functional once the gameplay engine is added in Phase 3.
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
