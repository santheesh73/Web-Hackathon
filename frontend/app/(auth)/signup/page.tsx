import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — LIFE RPG',
  description: 'Create your LIFE RPG account and start turning daily tasks into quests.',
};

export default function SignupPage() {
  return <SignupForm />;
}
