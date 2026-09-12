import * as React from 'react';
import Link from 'next/link';
import { Compass, Shield, LayoutDashboard, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 select-none">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card p-8 text-center shadow-2xl backdrop-blur-md">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6">
          {/* Compass Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-inner">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <span>Error 404 &bull; Uncharted Route</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lost in the Dungeon
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
              The scroll or pathway you were seeking does not exist or has dissolved into the shadows. Return to safe haven to continue your quest.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="sm" variant="rpg" className="w-full sm:w-auto gap-2 text-xs">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Button>
            </Link>

            <Link href="/" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto gap-2 text-xs border-border/60">
                <Home className="w-3.5 h-3.5" />
                <span>Home Page</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
