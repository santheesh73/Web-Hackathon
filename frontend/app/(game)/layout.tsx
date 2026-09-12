'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { AppShell } from '@/components/layout/AppShell';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { character, fetchCharacter, loading: charLoading } = useCharacter();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect unauthenticated visitors to login
        router.replace('/login');
      } else {
        // Check character existence
        fetchCharacter(user.id).then((char) => {
          if (!char) {
            // Redirect user without character to onboarding
            router.replace('/character-creation');
          } else {
            setChecked(true);
          }
        });
      }
    }
  }, [user, authLoading, fetchCharacter, router]);

  if (authLoading || !checked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Verifying adventurer credentials...</p>
        </div>
      </div>
    );
  }

  return <AppShell characterName={character?.name}>{children}</AppShell>;
}
