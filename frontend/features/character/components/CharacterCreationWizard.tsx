'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  BookOpen,
  Compass,
  Hammer,
  FlaskConical,
  Sparkles,
  Heart,
  Brain,
  Briefcase,
  Coins,
  Palette,
  User,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { AVATAR_OPTIONS, AvatarOption } from '@/lib/avatars';
import type { LifeFocus } from '@/../src/shared/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const AVATAR_ICONS: Record<string, LucideIcon> = {
  Shield,
  BookOpen,
  Compass,
  Hammer,
  FlaskConical,
  Sparkles,
};

interface LifeFocusOption {
  id: LifeFocus;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const LIFE_FOCUS_OPTIONS: LifeFocusOption[] = [
  {
    id: 'health',
    title: 'Health & Vitality',
    description: 'Build physical stamina, athletic consistency, and restorative habits.',
    icon: Heart,
    color: 'text-rose-500 bg-rose-50 border-rose-200',
  },
  {
    id: 'learning',
    title: 'Mind & Learning',
    description: 'Master deep focus, absorb complex skills, and read consistently.',
    icon: Brain,
    color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'career',
    title: 'Career & Craft',
    description: 'Execute strategic projects, leadership goals, and high-impact work.',
    icon: Briefcase,
    color: 'text-blue-500 bg-blue-50 border-blue-200',
  },
  {
    id: 'finance',
    title: 'Wealth & Finances',
    description: 'Cultivate financial discipline, sensible budgeting, and long-term security.',
    icon: Coins,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    id: 'creativity',
    title: 'Creative Expression',
    description: 'Create art, write stories, code side projects, and express novel ideas.',
    icon: Palette,
    color: 'text-purple-500 bg-purple-50 border-purple-200',
  },
  {
    id: 'personal',
    title: 'Habits & Mindfulness',
    description: 'Strengthen emotional resilience, relationships, and mindfulness practices.',
    icon: Sparkles,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
];

export function CharacterCreationWizard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { character, fetchCharacter, createCharacter, loading: charLoading, error: charError } = useCharacter();

  const [step, setStep] = React.useState<number>(1);
  const [characterName, setCharacterName] = React.useState<string>('');
  const [selectedAvatarId, setSelectedAvatarId] = React.useState<string>(AVATAR_OPTIONS[0].id);
  const [selectedFocus, setSelectedFocus] = React.useState<LifeFocus>('learning');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [isCreatedSuccess, setIsCreatedSuccess] = React.useState<boolean>(false);

  // Check if character already exists for this user
  React.useEffect(() => {
    if (user) {
      fetchCharacter(user.id).then((existing) => {
        if (existing) {
          // Prevent duplicate character creation
          router.replace('/dashboard');
        }
      });
    }
  }, [user, fetchCharacter, router]);

  const selectedAvatar = AVATAR_OPTIONS.find((a) => a.id === selectedAvatarId) || AVATAR_OPTIONS[0];
  const selectedFocusItem = LIFE_FOCUS_OPTIONS.find((f) => f.id === selectedFocus) || LIFE_FOCUS_OPTIONS[0];

  const validateStep1 = (): boolean => {
    const trimmed = characterName.trim();
    if (!trimmed) {
      setNameError('Character name is required');
      return false;
    }
    if (trimmed.length < 3) {
      setNameError('Character name must be at least 3 characters');
      return false;
    }
    if (trimmed.length > 24) {
      setNameError('Character name cannot exceed 24 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    if (!user) return;

    const result = await createCharacter(user.id, {
      name: characterName.trim(),
      avatar: selectedAvatarId,
      lifeFocus: selectedFocus,
    });

    if (result.success) {
      setIsCreatedSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    }
  };

  if (authLoading || (user && charLoading && !characterName)) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading adventurer profile...</p>
      </Card>
    );
  }

  if (isCreatedSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <Card className="text-center p-8 border-emerald-200 bg-emerald-50/30">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg">
            <Check className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Character Created!
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            Welcome to LIFE RPG, <span className="font-semibold text-foreground">{characterName}</span>. Entering the application shell...
          </CardDescription>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Onboarding Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Step 0{step} of 04</span>
          <span className="text-foreground">
            {step === 1 && 'Identity'}
            {step === 2 && 'Avatar'}
            {step === 3 && 'Life Focus'}
            {step === 4 && 'Confirmation'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-surface-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {charError && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{charError}</span>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <Badge variant="rpg" size="sm" className="w-fit mb-1">
                  01 Identity
                </Badge>
                <CardTitle className="text-2xl font-bold">Choose Your Character Name</CardTitle>
                <CardDescription>
                  This is your public persona in the LIFE RPG universe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Character Name"
                  placeholder="E.g. Valerius, Solon, Nova"
                  value={characterName}
                  onChange={(e) => {
                    setCharacterName(e.target.value);
                    if (nameError) validateStep1();
                  }}
                  error={nameError || undefined}
                  autoFocus
                />

                {/* Live Character Badge Preview */}
                <div className="p-4 rounded-xl border border-border bg-surface-muted/60 space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Live Preview Card
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {characterName ? characterName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {characterName || 'Your Character Name'}
                      </p>
                      <p className="text-xs text-muted-foreground">Level 1 &bull; Novice Adventurer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border/60 pt-4">
                <Button variant="primary" onClick={handleNext} icon={<ArrowRight className="h-4 w-4" />}>
                  Continue to Avatar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <Badge variant="rpg" size="sm" className="w-fit mb-1">
                  02 Avatar
                </Badge>
                <CardTitle className="text-2xl font-bold">Select Your Avatar</CardTitle>
                <CardDescription>
                  Choose the archetype that best represents your current philosophy and mindset.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  role="radiogroup"
                  aria-label="Select Avatar"
                >
                  {AVATAR_OPTIONS.map((opt) => {
                    const Icon = AVATAR_ICONS[opt.iconName] || Shield;
                    const isSelected = selectedAvatarId === opt.id;

                    return (
                      <div
                        key={opt.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setSelectedAvatarId(opt.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setSelectedAvatarId(opt.id);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 select-none relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                            : 'border-border bg-surface hover:bg-surface-muted hover:border-border/80'
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center text-white mb-2 shadow-sm`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-foreground leading-tight">{opt.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.archetype}</p>

                        {isSelected && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Selected avatar detail */}
                <div className="p-3 rounded-lg border border-border bg-surface-muted/40 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedAvatar.name}:</span>{' '}
                  {selectedAvatar.description}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/60 pt-4">
                <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext} icon={<ArrowRight className="h-4 w-4" />}>
                  Continue to Focus
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <Badge variant="rpg" size="sm" className="w-fit mb-1">
                  03 Life Focus
                </Badge>
                <CardTitle className="text-2xl font-bold">Choose Your Primary Domain</CardTitle>
                <CardDescription>
                  Where would you like to build the most momentum in your daily life right now?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-2.5"
                  role="radiogroup"
                  aria-label="Select Life Focus"
                >
                  {LIFE_FOCUS_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedFocus === item.id;

                    return (
                      <div
                        key={item.id}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onClick={() => setSelectedFocus(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setSelectedFocus(item.id);
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                            : 'border-border bg-surface hover:bg-surface-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center border ${item.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ml-2">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/60 pt-4">
                <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext} icon={<ArrowRight className="h-4 w-4" />}>
                  Review Summary
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <Badge variant="rpg" size="sm" className="w-fit mb-1">
                  04 Confirmation
                </Badge>
                <CardTitle className="text-2xl font-bold">Ready to Begin</CardTitle>
                <CardDescription>
                  Review your character identity before embarking on your progression journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Character Summary Box */}
                <div className="rounded-xl border border-border bg-gradient-to-b from-surface to-surface-muted p-5 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${selectedAvatar.color} flex items-center justify-center text-white font-bold shadow-md`}
                    >
                      {React.createElement(AVATAR_ICONS[selectedAvatar.iconName] || Shield, {
                        className: 'h-7 w-7',
                      })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{characterName}</h3>
                        <Badge variant="rpg" size="sm">
                          LV 1
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedAvatar.name} &bull; {selectedAvatar.archetype}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                        Primary Focus
                      </span>
                      <span className="font-semibold text-foreground mt-0.5 block">
                        {selectedFocusItem.title}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-surface">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                        Initial Rank
                      </span>
                      <span className="font-semibold text-amber-600 mt-0.5 block">
                        Novice I (0 XP)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Your character is securely stored and tied to your account.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border/60 pt-4">
                <Button variant="outline" onClick={handleBack} icon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  loading={charLoading}
                  onClick={handleFinish}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Begin Your Journey
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
