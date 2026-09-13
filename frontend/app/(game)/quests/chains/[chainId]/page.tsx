'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Layers,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestCategoryBadge } from '@/components/quests/quest-category';
import { useQuestChains } from '@/features/quest-chains/use-quest-chains';
import type { QuestChainWithSteps } from '@/../src/shared/types/quest-chain';

export default function QuestChainDetailPage() {
  const params = useParams();
  const chainId = params?.chainId as string;
  const { getChainById } = useQuestChains();

  const [chain, setChain] = React.useState<QuestChainWithSteps | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadChain = React.useCallback(async () => {
    if (!chainId) return;
    setLoading(true);
    setError(null);
    const data = await getChainById(chainId);
    if (data) {
      setChain(data);
    } else {
      setError('Quest chain not found.');
    }
    setLoading(false);
  }, [chainId, getChainById]);

  React.useEffect(() => {
    loadChain();
  }, [loadChain]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
        <div className="h-6 w-36 bg-surface-muted animate-pulse rounded" />
        <div className="h-12 w-2/3 bg-surface-muted animate-pulse rounded-lg" />
        <div className="h-64 w-full bg-surface-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !chain) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Chain Not Found</h2>
        <p className="text-xs text-muted-foreground">{error || 'This quest chain does not exist.'}</p>
        <div className="pt-2">
          <Link href="/quests/chains">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Quest Chains
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = chain.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Navigation link */}
      <div>
        <Link
          href="/quests/chains"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Quest Chains
        </Link>
      </div>

      {/* Main Chain Header Card */}
      <Card
        className={`p-6 sm:p-8 space-y-6 border-2 transition-all ${
          isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-border bg-surface'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'
              }`}
            >
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quest Chain
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {chain.title}
              </h1>
            </div>
          </div>

          <div>
            {isCompleted ? (
              <Badge variant="success" size="md" className="gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </Badge>
            ) : (
              <Badge variant="rpg" size="md" className="gap-1.5 font-bold">
                <Clock className="h-4 w-4" /> Active Chain
              </Badge>
            )}
          </div>
        </div>

        {chain.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {chain.description}
          </p>
        )}

        {/* Progress Bar & Counter */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Progression Timeline</span>
            <span className="text-foreground">
              {chain.completedSteps} of {chain.totalSteps} Quests Conquered ({chain.progressPercent}%)
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={chain.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${chain.title} completion progress`}
            className="w-full h-3 rounded-full bg-surface-muted border border-border/80 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-indigo-600'
              }`}
              style={{ width: `${chain.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Chain Completion Banner */}
        {isCompleted && (
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2.5">
              <Award className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm">Quest Chain Conquered!</h4>
                <p className="text-emerald-800">
                  You conquered every step in this roadmap. Great discipline!
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Sequential Steps Roadmap */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" /> Roadmap Steps
        </h3>

        <div className="space-y-4">
          {chain.steps.map((step) => {
            const isStepCompleted = step.status === 'COMPLETED';
            const isStepAvailable = step.status === 'AVAILABLE';
            const isStepLocked = step.status === 'LOCKED';

            return (
              <Card
                key={step.id}
                className={`p-5 sm:p-6 border-2 transition-all relative overflow-hidden ${
                  isStepCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isStepAvailable
                    ? 'border-primary ring-2 ring-primary/20 bg-surface shadow-sm'
                    : 'border-border bg-surface-muted/60 opacity-65'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Step order avatar / icon */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                        isStepCompleted
                          ? 'bg-emerald-500 text-white'
                          : isStepAvailable
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-muted text-muted-foreground'
                      }`}
                    >
                      {isStepCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isStepLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <span>{step.stepOrder}</span>
                      )}
                    </div>

                    {/* Step Quest Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Step {step.stepOrder}
                        </span>

                        {step.quest && (
                          <>
                            <QuestCategoryBadge category={step.quest.category} size="sm" />
                            <Badge variant="neutral" size="sm">
                              {step.quest.difficulty}
                            </Badge>
                            <Badge variant="rpg" size="sm">
                              +{step.quest.xpReward} XP
                            </Badge>
                          </>
                        )}
                      </div>

                      <h4
                        className={`text-base font-bold ${
                          isStepCompleted
                            ? 'line-through text-muted-foreground'
                            : isStepLocked
                            ? 'text-slate-600'
                            : 'text-foreground'
                        }`}
                      >
                        {step.quest?.title || 'Quest Step'}
                      </h4>

                      {step.quest?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {step.quest.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step Action / Status Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    {isStepCompleted ? (
                      <Badge variant="success" size="md" className="gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Conquered
                      </Badge>
                    ) : isStepAvailable ? (
                      step.quest ? (
                        <Link href={`/quests/${step.quest.id}`}>
                          <Button variant="rpg" size="sm" className="gap-1.5 font-bold shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" /> Complete Quest <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="rpg" size="md">
                          Available
                        </Badge>
                      )
                    ) : (
                      <Badge variant="neutral" size="md" className="gap-1.5 text-slate-500">
                        <Lock className="h-3.5 w-3.5" /> Locked Step
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
