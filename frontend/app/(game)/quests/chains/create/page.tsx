'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuestChains } from '@/features/quest-chains/use-quest-chains';
import {
  QUEST_CATEGORIES,
  DIFFICULTY_XP_MAP,
} from '@/features/progression/level-engine';
import type { QuestCategory, QuestDifficulty } from '@/../src/shared/types/quest';

interface StepDraft {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
}

export default function CreateQuestChainPage() {
  const router = useRouter();
  const { createChain } = useQuestChains();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [steps, setSteps] = React.useState<StepDraft[]>([
    {
      id: 'step-init-1',
      title: 'Foundation Study',
      description: 'Master core concepts and vocabulary',
      category: 'Learning',
      difficulty: 'Easy',
    },
    {
      id: 'step-init-2',
      title: 'Practical Project',
      description: 'Apply learnings to an end-to-end prototype',
      category: 'Learning',
      difficulty: 'Medium',
    },
  ]);

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleAddStep = () => {
    if (steps.length >= 20) return;
    setSteps([
      ...steps,
      {
        id: 'step-custom-' + Date.now(),
        title: '',
        description: '',
        category: 'Learning',
        difficulty: 'Medium',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 2) {
      setError('A quest chain must consist of at least 2 steps.');
      return;
    }
    setError(null);
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index - 1];
    newSteps[index - 1] = newSteps[index];
    newSteps[index] = temp;
    setSteps(newSteps);
  };

  const handleMoveDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index + 1];
    newSteps[index + 1] = newSteps[index];
    newSteps[index] = temp;
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof StepDraft, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Chain title must be at least 3 characters.');
      return;
    }

    if (steps.length < 2) {
      setError('A quest chain must contain at least 2 steps.');
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      if (steps[i].title.trim().length < 3) {
        setError(`Step ${i + 1} must have a quest title of at least 3 characters.`);
        return;
      }
    }

    setSubmitting(true);
    const res = await createChain({
      title: title.trim(),
      description: description.trim() || undefined,
      steps: steps.map((s) => ({
        title: s.title.trim(),
        description: s.description.trim() || undefined,
        category: s.category,
        difficulty: s.difficulty,
      })),
    });

    setSubmitting(false);

    if (res.success && res.chain) {
      router.push(`/quests/chains/${res.chain.id}`);
    } else {
      setError(res.error || 'Failed to create quest chain.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Navigation link */}
      <div>
        <Link
          href="/quests/chains"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Quest Chains
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6 border-border bg-surface">
          <CardHeader className="p-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Create Quest Chain</CardTitle>
                <CardDescription className="text-xs">
                  Construct a multi-step quest sequence with sequential unlock mechanics.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chain Metadata */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Chain Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Full-Stack Web Development"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What macro real-life transformation does this quest sequence achieve?"
                maxLength={500}
                rows={2}
                className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all resize-none"
              />
            </div>
          </div>

          {/* Ordered Steps Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">Sequential Steps</h4>
                <p className="text-xs text-muted-foreground">
                  Step 1 will unlock immediately. Future steps stay locked until the previous step is conquered.
                </p>
              </div>
              <Badge variant="rpg" size="sm">
                {steps.length} Steps
              </Badge>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-4 rounded-xl border border-border bg-surface-muted/30 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        Step {idx + 1} {idx === 0 ? '(Starting Quest)' : '(Locked initially)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="h-7 w-7 p-0"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === steps.length - 1}
                        className="h-7 w-7 p-0"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={steps.length <= 2}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        title="Delete Step"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 space-y-1">
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(idx, 'title', e.target.value)}
                        placeholder="Step quest title"
                        maxLength={80}
                        required
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <select
                        value={step.category}
                        onChange={(e) => updateStep(idx, 'category', e.target.value as QuestCategory)}
                        className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {QUEST_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <select
                        value={step.difficulty}
                        onChange={(e) => updateStep(idx, 'difficulty', e.target.value as QuestDifficulty)}
                        className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <option value="Easy">Easy (+25 XP)</option>
                        <option value="Medium">Medium (+50 XP)</option>
                        <option value="Hard">Hard (+100 XP)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddStep}
              disabled={steps.length >= 20}
              className="w-full gap-1.5 text-xs font-semibold py-2.5"
            >
              <PlusCircle className="h-4 w-4" /> Add Next Step
            </Button>
          </div>

          <CardFooter className="p-0 pt-4 border-t border-border flex items-center justify-end gap-3">
            <Link href="/quests/chains">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="rpg"
              size="md"
              disabled={submitting}
              className="gap-2 shadow-sm font-bold"
            >
              <Sparkles className="h-4 w-4" />
              {submitting ? 'Assembling Chain...' : 'Create Quest Chain'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
