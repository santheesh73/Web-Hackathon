'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { SignupSchema, type SignupInput } from '@/../src/shared/schemas/auth';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    const result = await signUp(data.email, data.password, data.displayName);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (result.requiresEmailConfirmation) {
      setEmailConfirmationRequired(true);
    } else {
      router.push('/character-creation');
    }
  };

  if (emailConfirmationRequired) {
    return (
      <Card className="shadow-lg border-border/80 text-center">
        <CardHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to your email address. Once confirmed, you can sign in and create your character.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button variant="primary" fullWidth>
              Return to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Begin Your Journey</CardTitle>
        <CardDescription>Create your account to start leveling up your daily life.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Display Name"
            placeholder="E.g. Alex"
            error={errors.displayName?.message}
            {...register('displayName')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            icon={<UserPlus className="h-4 w-4" />}
            className="mt-2"
          >
            Create Account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
