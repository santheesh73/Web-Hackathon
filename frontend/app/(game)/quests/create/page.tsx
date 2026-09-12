'use client';

import * as React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { QuestForm } from '@/components/quests/quest-form';
import { useQuests } from '@/features/quests/use-quests';

export default function CreateQuestPage() {
  const { createQuest } = useQuests();

  return (
    <PageContainer size="md">
      <QuestForm onSubmit={createQuest} />
    </PageContainer>
  );
}
