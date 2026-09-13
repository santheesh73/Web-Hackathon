'use client';

import * as React from 'react';
import Link from 'next/link';
import { Layers, PlusCircle, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuestChainCard } from '@/components/quests/quest-chain-card';
import { useQuestChains } from '@/features/quest-chains/use-quest-chains';

export default function QuestChainsPage() {
  const { chains, loading, error } = useQuestChains();
  const [filter, setFilter] = React.useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  const filteredChains = React.useMemo(() => {
    if (filter === 'ACTIVE') return chains.filter((c) => c.status === 'ACTIVE');
    if (filter === 'COMPLETED') return chains.filter((c) => c.status === 'COMPLETED');
    return chains;
  }, [chains, filter]);

  const activeCount = chains.filter((c) => c.status === 'ACTIVE').length;
  const completedCount = chains.filter((c) => c.status === 'COMPLETED').length;

  return (
    <PageContainer>
      <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/quests"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Quest Board
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-7 w-7 text-primary" /> Quest Chains
          </h1>
          <p className="text-sm text-muted-foreground">
            Multi-step sequential roadmaps that turn larger life ambitions into conquerable milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/quests/chains/create">
            <Button variant="rpg" size="md" className="gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" /> Create Quest Chain
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
            }`}
          >
            All Chains ({chains.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'ACTIVE'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'COMPLETED'
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-56 rounded-2xl bg-surface-muted animate-pulse border border-border" />
          <div className="h-56 rounded-2xl bg-surface-muted animate-pulse border border-border" />
          <div className="h-56 rounded-2xl bg-surface-muted animate-pulse border border-border" />
        </div>
      ) : filteredChains.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-surface/40 space-y-4 max-w-md mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Layers className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">No Quest Chains Found</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {filter === 'ALL'
                ? 'Create a sequential chain of quests to tackle comprehensive goals like learning a skill, preparing a portfolio, or training for an athletic milestone.'
                : `You currently have no ${filter.toLowerCase()} quest chains.`}
            </p>
          </div>
          <div className="pt-2">
            <Link href="/quests/chains/create">
              <Button variant="rpg" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" /> Create First Chain
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChains.map((chain) => (
            <QuestChainCard key={chain.id} chain={chain} />
          ))}
        </div>
      )}
      </div>
    </PageContainer>
  );
}
