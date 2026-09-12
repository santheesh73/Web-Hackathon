'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Calendar, Swords, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  QuestCreationSchema,
  type QuestCreationInput,
} from '@/../src/shared/schemas/quest';
import {
  QUEST_CATEGORIES,
  DIFFICULTY_XP_MAP,
  getXpForDifficulty,
} from '@/features/progression/xp-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { QuestDifficulty, QuestCategory } from '@/../src/shared/types/quest';

export interface QuestFormProps {
  onSubmit: (data: QuestCreationInput) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export function QuestForm({ onSubmit, loading = false }: QuestFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestCreationInput>({
    resolver: zodResolver(QuestCreationSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Learning',
      difficulty: 'Medium',
      dueDate: '',
    },
  });

  const selectedDifficulty = watch('difficulty') as QuestDifficulty;
  const selectedCategory = watch('category') as QuestCategory;
  const estimatedXp = getXpForDifficulty(selectedDifficulty || 'Medium');

  const handleFormSubmit = async (data: QuestCreationInput) => {
    setServerError(null);
    const res = await onSubmit(data);
    if (!res.success && res.error) {
      setServerError(res.error);
    } else {
      router.push('/quests');
    }
  };

  const difficulties: QuestDifficulty[] = ['Easy', 'Medium', 'Hard'];

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-border/80">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <Badge variant="rpg" size="sm">
            New Quest
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">Define Your Real-Life Quest</CardTitle>
        <CardDescription>
          Transform a tangible task or productivity milestone into actionable RPG progression.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Title */}
          <Input
            label="Quest Title"
            placeholder="E.g. Study React for 1 hour, Run 5km, Draft quarterly review"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="quest-description"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Description (Optional)
            </label>
            <textarea
              id="quest-description"
              rows={3}
              placeholder="Outline specific objectives, notes, or criteria for completion..."
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-subtle transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs font-medium text-danger">{errors.description.message}</p>
            )}
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Life Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUEST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setValue('category', cat)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all select-none text-left flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                      : 'border-border bg-surface hover:bg-surface-muted text-muted-foreground'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Picker with Live XP Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Difficulty &amp; Estimated XP
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((diff) => {
                const xp = DIFFICULTY_XP_MAP[diff];
                const isSelected = selectedDifficulty === diff;

                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setValue('difficulty', diff)}
                    className={`p-3 rounded-xl border text-center transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-400 shadow-sm'
                        : 'border-border bg-surface hover:bg-surface-muted'
                    }`}
                  >
                    <p className="text-xs font-bold text-foreground">{diff}</p>
                    <p className="text-xs font-semibold text-amber-600 mt-1 flex items-center justify-center gap-0.5">
                      <Sparkles className="h-3 w-3" /> +{xp} XP
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Input
              label="Target Due Date (Optional)"
              type="date"
              icon={<Calendar className="h-4 w-4" />}
              {...register('dueDate')}
            />
          </div>

          {/* Submission Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting || loading}
              icon={<Swords className="h-4 w-4" />}
            >
              Save &amp; Post Quest
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
