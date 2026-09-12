import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuestList } from '@/components/quests/quest-list';

export const metadata: Metadata = {
  title: 'Quest Board — LIFE RPG',
  description: 'Manage and conquer your active and completed real-life quests.',
};

export default function QuestsPage() {
  return (
    <PageContainer>
      <QuestList />
    </PageContainer>
  );
}
