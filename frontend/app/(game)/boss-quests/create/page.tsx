'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BossForm } from '@/components/boss/boss-form';

export default function CreateBossQuestPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/boss-quests">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Back to Boss Quests">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Summon a Boss Quest
          </h1>
          <p className="text-xs text-muted-foreground">
            Break down a monumental real-life milestone into actionable objectives.
          </p>
        </div>
      </div>

      <BossForm />
    </div>
  );
}
