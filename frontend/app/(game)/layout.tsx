import * as React from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
