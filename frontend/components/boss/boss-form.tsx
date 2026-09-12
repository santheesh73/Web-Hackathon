'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Trophy,
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BOSS_DIFFICULTIES,
  BOSS_REWARD_MAP,
  BOSS_DIFFICULTY_CONFIG,
} from '@/features/boss-quests/boss-engine';
import { useBossQuests } from '@/features/boss-quests/use-boss-quests';
import type { BossDifficulty } from '@/features/boss-quests/types';

interface ObjectiveField {
  title: string;
  description?: string;
  requiredProgress: number;
}

export function BossForm() {
  const router = useRouter();
  const { createBossQuest } = useBossQuests();

  const [step, setStep] = React.useState<number>(1);
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [difficulty, setDifficulty] = React.useState<BossDifficulty>('Epic');
  const [deadline, setDeadline] = React.useState<string>('');
  const [objectives, setObjectives] = React.useState<ObjectiveField[]>([
    { title: '', description: '', requiredProgress: 1 },
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const handleAddObjective = () => {
    setObjectives((prev) => [
      ...prev,
      { title: '', description: '', requiredProgress: 1 },
    ]);
  };

  const handleRemoveObjective = (index: number) => {
    if (objectives.length <= 1) return;
    setObjectives((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleObjectiveChange = (index: number, field: keyof ObjectiveField, value: string | number) => {
    setObjectives((prev) =>
      prev.map((obj, idx) => (idx === index ? { ...obj, [field]: value } : obj))
    );
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      setError('Please provide a title for your major goal.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!difficulty) {
      setError('Please select a Boss difficulty.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (objectives.length === 0) {
      setError('At least one milestone objective is required.');
      return false;
    }
    const emptyObj = objectives.some((o) => !o.title.trim());
    if (emptyObj) {
      setError('Please give every objective a valid title.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setSubmitting(true);
    setError(null);

    const res = await createBossQuest({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      deadline: deadline || undefined,
      objectives: objectives.map((o) => ({
        title: o.title.trim(),
        description: o.description?.trim() || undefined,
        requiredProgress: Number(o.requiredProgress) || 1,
      })),
    });

    setSubmitting(false);

    if (res.success && res.boss) {
      router.push(`/boss-quests/${res.boss.id}`);
    } else {
      setError(res.error || 'Failed to create Boss Quest. Please try again.');
    }
  };

  const currentDiffConfig = BOSS_DIFFICULTY_CONFIG[difficulty];
  const rewardXp = BOSS_REWARD_MAP[difficulty];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-mono text-muted-foreground">
        <span className={step >= 1 ? 'text-amber-500 font-bold' : ''}>1. Goal</span>
        <span>&rarr;</span>
        <span className={step >= 2 ? 'text-amber-500 font-bold' : ''}>2. Difficulty</span>
        <span>&rarr;</span>
        <span className={step >= 3 ? 'text-amber-500 font-bold' : ''}>3. Objectives</span>
        <span>&rarr;</span>
        <span className={step >= 4 ? 'text-amber-500 font-bold' : ''}>4. Review</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-red-500 text-xs font-mono uppercase tracking-wider font-bold">
            <Flame className="h-4 w-4 animate-pulse" />
            Summon a Boss Quest
          </div>
          <CardTitle className="text-xl font-bold">
            {step === 1 && 'Define Your Epic Goal'}
            {step === 2 && 'Set Challenge Difficulty & Deadline'}
            {step === 3 && 'Break Goal into Milestone Objectives'}
            {step === 4 && 'Confirm & Summon Boss'}
          </CardTitle>
          <CardDescription className="text-xs">
            {step === 1 && 'Turn a major life project, exam, or career milestone into a Boss battle.'}
            {step === 2 && 'Higher difficulty yields massive XP bounties to accelerate your progression.'}
            {step === 3 && 'Create clear objectives that can be completed through real-life quests.'}
            {step === 4 && 'Verify all battle parameters before awakening this monumental challenge.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* STEP 1: Goal Title & Description */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="boss-title">
                  Boss Goal Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="boss-title"
                  placeholder="e.g. Launch My Portfolio, Prepare for AWS Exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="boss-desc">
                  Description & Context
                </label>
                <textarea
                  id="boss-desc"
                  rows={3}
                  placeholder="Describe why this goal matters, scope of work, and expected outcome..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Difficulty & Deadline */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Boss Difficulty Tier <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BOSS_DIFFICULTIES.map((diff) => {
                    const cfg = BOSS_DIFFICULTY_CONFIG[diff];
                    const isSelected = difficulty === diff;

                    return (
                      <button
                        type="button"
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                            : 'border-border bg-card hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground">{cfg.label}</span>
                          <Badge variant={cfg.badgeVariant} size="sm">
                            +{cfg.xp} XP
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          {diff === 'Rare' && '1-2 week milestone'}
                          {diff === 'Epic' && '1-3 month major project'}
                          {diff === 'Legendary' && 'Transformational goal'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="boss-deadline">
                  Target Completion Deadline (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="boss-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Milestone Objectives */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Milestone Objectives ({objectives.length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleAddObjective}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Objective</span>
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-card space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        Objective {String(idx + 1).padStart(2, '0')}
                      </span>
                      {objectives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                          aria-label={`Remove objective ${idx + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <Input
                      placeholder={`e.g. ${
                        idx === 0
                          ? 'Design System & Mockups'
                          : idx === 1
                          ? 'Implement Core Features'
                          : 'Testing & Deployment'
                      }`}
                      value={obj.title}
                      onChange={(e) => handleObjectiveChange(idx, 'title', e.target.value)}
                      maxLength={100}
                    />

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-muted-foreground shrink-0" htmlFor={`req-prog-${idx}`}>
                        Required Quests:
                      </label>
                      <Input
                        id={`req-prog-${idx}`}
                        type="number"
                        min={1}
                        max={50}
                        value={obj.requiredProgress}
                        onChange={(e) =>
                          handleObjectiveChange(
                            idx,
                            'requiredProgress',
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-20 h-7 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Goal</span>
                    <h4 className="text-base font-bold text-foreground">{title}</h4>
                    {description && (
                      <p className="text-xs text-muted-foreground pt-0.5">{description}</p>
                    )}
                  </div>
                  <Badge variant={currentDiffConfig.badgeVariant} size="sm">
                    {difficulty}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Reward: <strong className="text-foreground">+{rewardXp} XP</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: <strong className="text-foreground">{deadline ? new Date(deadline).toLocaleDateString() : 'None'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                  Battle Objectives ({objectives.length})
                </span>
                <div className="space-y-1.5">
                  {objectives.map((o, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-md bg-muted/40"
                    >
                      <span className="font-medium text-foreground truncate pr-2">
                        {idx + 1}. {o.title}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px] shrink-0">
                        {o.requiredProgress} quests required
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setStep((s) => s - 1);
              }}
              disabled={submitting}
              className="gap-1 text-xs"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Previous</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-xs"
            >
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="rpg"
              size="sm"
              onClick={() => {
                if (step === 1 && validateStep1()) setStep(2);
                else if (step === 2 && validateStep2()) setStep(3);
                else if (step === 3 && validateStep3()) setStep(4);
              }}
              className="gap-1 text-xs"
            >
              <span>Continue</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="rpg"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 text-xs font-bold"
            >
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              <span>{submitting ? 'Summoning...' : 'Awaken Boss Quest'}</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
