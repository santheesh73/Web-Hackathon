'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  characterName?: string;
}

export function AppShell({ children, pageTitle = 'Dashboard', characterName }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-row antialiased text-foreground">
      {/* Desktop Persistent Sidebar */}
      <Sidebar characterName={characterName} />

      {/* Mobile Drawer Navigation */}
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMobileMenuOpen={() => setMobileNavOpen(true)}
          title={pageTitle}
          characterName={characterName}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
