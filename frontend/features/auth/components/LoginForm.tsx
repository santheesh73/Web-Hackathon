'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { LoginSchema, type LoginInput } from '@/../src/shared/schemas/auth';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { fetchCharacter } = useCharacter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const result = await signIn(data.email, data.password);

    if (result.error) {
      setServerError(result.error);
      return;
    }

    // Check if character already exists for this account
    // If Supabase user or local user, fetch character
    const char = await fetchCharacter(data.email);
    if (char) {
      router.push('/dashboard');
    } else {
      router.push('/character-creation');
    }
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to resume your journey.</CardDescription>
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
                placeholder="••••••••"
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            icon={<LogIn className="h-4 w-4" />}
            className="mt-2"
          >
            Sign In
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span>
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
