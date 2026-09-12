import type { Metadata } from 'next';
import { CharacterCreationWizard } from '@/features/character/components/CharacterCreationWizard';

export const metadata: Metadata = {
  title: 'Character Creation — LIFE RPG',
  description: 'Forge your LIFE RPG adventurer persona and embark on your journey.',
};

export default function CharacterCreationPage() {
  return <CharacterCreationWizard />;
}
