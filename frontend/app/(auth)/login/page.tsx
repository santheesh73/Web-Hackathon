import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — LIFE RPG',
  description: 'Sign in to continue your real-life RPG productivity journey.',
};

export default function LoginPage() {
  return <LoginForm />;
}
