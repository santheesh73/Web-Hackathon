import * as React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 text-foreground">
      {/* Brand Header */}
      <header className="flex justify-center">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-foreground block leading-tight">
              LIFE RPG
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
              Turn Life into Quests
            </span>
          </div>
        </Link>
      </header>

      {/* Auth Content */}
      <main className="w-full max-w-md mx-auto my-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground">
        <p>LIFE RPG &bull; Gamified Productivity Platform</p>
      </footer>
    </div>
  );
}
