'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type {
  QuestChain,
  QuestChainStep,
  QuestChainWithSteps,
} from '@/../src/shared/types/quest-chain';
import type { Quest } from '@/../src/shared/types/quest';
import {
  QuestChainCreationSchema,
  type QuestChainCreationInput,
} from '@/../src/shared/schemas/quest-chain';
import { DIFFICULTY_XP_MAP } from '@/features/progression/level-engine';

const LOCAL_STORAGE_CHAINS_PREFIX = 'life_rpg_chains_';
const LOCAL_STORAGE_CHAIN_STEPS_PREFIX = 'life_rpg_chain_steps_';
const LOCAL_STORAGE_QUESTS_PREFIX = 'life_rpg_quests_';

export function useQuestChains() {
  const { user } = useAuth();
  const [chains, setChains] = React.useState<QuestChainWithSteps[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchChains = React.useCallback(async (): Promise<QuestChainWithSteps[]> => {
    if (!user) {
      setChains([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // 1. Fetch chains
        const { data: chainRows, error: cErr } = await supabase
          .from('quest_chains')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (cErr) {
          setError(cErr.message);
          setLoading(false);
          return [];
        }

        // 2. Fetch steps with quests for all chains
        const chainIds = (chainRows || []).map((c) => c.id);
        let stepRows: any[] = [];
        if (chainIds.length > 0) {
          const { data: sData } = await supabase
            .from('quest_chain_steps')
            .select('*, quest:quests(*)')
            .in('chain_id', chainIds)
            .order('step_order', { ascending: true });
          stepRows = sData || [];
        }

        const enriched: QuestChainWithSteps[] = (chainRows || []).map((c) => {
          const rawSteps = stepRows.filter((s) => s.chain_id === c.id);
          const steps: QuestChainStep[] = rawSteps.map((s) => ({
            id: s.id,
            chainId: s.chain_id,
            questId: s.quest_id,
            stepOrder: s.step_order,
            status: s.status,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            quest: s.quest
              ? {
                  id: s.quest.id,
                  userId: s.quest.user_id,
                  characterId: s.quest.character_id,
                  title: s.quest.title,
                  description: s.quest.description || '',
                  category: s.quest.category,
                  difficulty: s.quest.difficulty,
                  xpReward: s.quest.xp_reward,
                  status: s.quest.status,
                  dueDate: s.quest.due_date || undefined,
                  createdAt: s.quest.created_at,
                  updatedAt: s.quest.updated_at,
                  completedAt: s.quest.completed_at || undefined,
                }
              : undefined,
          }));

          const totalSteps = steps.length;
          const completedSteps = steps.filter((s) => s.status === 'COMPLETED').length;
          const progressPercent =
            totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
          const currentStep = steps.find((s) => s.status === 'AVAILABLE') || steps[0];

          return {
            id: c.id,
            userId: c.user_id,
            title: c.title,
            description: c.description || '',
            status: c.status,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            steps,
            totalSteps,
            completedSteps,
            progressPercent,
            currentStep,
          };
        });

        setChains(enriched);
        setLoading(false);
        return enriched;
      } else {
        // LocalStorage fallback
        const chainsKey = `${LOCAL_STORAGE_CHAINS_PREFIX}${user.id}`;
        const stepsKey = `${LOCAL_STORAGE_CHAIN_STEPS_PREFIX}${user.id}`;
        const questsKey = `${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`;

        const rawChains: QuestChain[] = JSON.parse(localStorage.getItem(chainsKey) || '[]');
        const rawSteps: QuestChainStep[] = JSON.parse(localStorage.getItem(stepsKey) || '[]');
        const rawQuests: Quest[] = JSON.parse(localStorage.getItem(questsKey) || '[]');

        const enriched: QuestChainWithSteps[] = rawChains.map((c) => {
          const steps = rawSteps
            .filter((s) => s.chainId === c.id)
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((s) => ({
              ...s,
              quest: rawQuests.find((q) => q.id === s.questId),
            }));

          const totalSteps = steps.length;
          const completedSteps = steps.filter((s) => s.status === 'COMPLETED').length;
          const progressPercent =
            totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
          const currentStep = steps.find((s) => s.status === 'AVAILABLE') || steps[0];

          return {
            ...c,
            steps,
            totalSteps,
            completedSteps,
            progressPercent,
            currentStep,
          };
        });

        setChains(enriched);
        setLoading(false);
        return enriched;
      }
    } catch {
      setError('Failed to load quest chains.');
      setLoading(false);
      return [];
    }
  }, [user, configured]);

  React.useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const getChainById = React.useCallback(
    async (chainId: string): Promise<QuestChainWithSteps | null> => {
      const all = await fetchChains();
      return all.find((c) => c.id === chainId) || null;
    },
    [fetchChains]
  );

  const createChain = async (
    input: QuestChainCreationInput
  ): Promise<{ success: boolean; error?: string; chain?: QuestChainWithSteps }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    const validation = QuestChainCreationSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid chain data' };
    }

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // 1. Fetch character id
        const { data: charData } = await supabase
          .from('characters')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!charData) {
          return { success: false, error: 'Character profile required to create quest chains.' };
        }

        // 2. Insert quest chain
        const { data: chainData, error: chainErr } = await supabase
          .from('quest_chains')
          .insert({
            user_id: user.id,
            title: input.title,
            description: input.description || null,
            status: 'ACTIVE',
          })
          .select()
          .single();

        if (chainErr || !chainData) {
          return { success: false, error: chainErr?.message || 'Failed to create chain.' };
        }

        // 3. For each step, create the quest and the chain step
        for (let i = 0; i < input.steps.length; i++) {
          const stepItem = input.steps[i];
          let questId = stepItem.questId;

          if (!questId) {
            const xpReward = DIFFICULTY_XP_MAP[stepItem.difficulty] || 50;
            const { data: qData, error: qErr } = await supabase
              .from('quests')
              .insert({
                user_id: user.id,
                character_id: charData.id,
                title: stepItem.title,
                description: stepItem.description || null,
                category: stepItem.category,
                difficulty: stepItem.difficulty,
                xp_reward: xpReward,
                status: 'ACTIVE',
              })
              .select()
              .single();

            if (qErr || !qData) {
              return { success: false, error: 'Failed to create step quest.' };
            }
            questId = qData.id;
          }

          // Step 1 is AVAILABLE; subsequent are LOCKED
          const stepStatus = i === 0 ? 'AVAILABLE' : 'LOCKED';

          await supabase.from('quest_chain_steps').insert({
            chain_id: chainData.id,
            quest_id: questId,
            step_order: i + 1,
            status: stepStatus,
          });
        }

        await fetchChains();
        const created = await getChainById(chainData.id);
        return { success: true, chain: created || undefined };
      } else {
        // LocalStorage mode
        const chainsKey = `${LOCAL_STORAGE_CHAINS_PREFIX}${user.id}`;
        const stepsKey = `${LOCAL_STORAGE_CHAIN_STEPS_PREFIX}${user.id}`;
        const questsKey = `${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`;

        const rawChains: QuestChain[] = JSON.parse(localStorage.getItem(chainsKey) || '[]');
        const rawSteps: QuestChainStep[] = JSON.parse(localStorage.getItem(stepsKey) || '[]');
        const rawQuests: Quest[] = JSON.parse(localStorage.getItem(questsKey) || '[]');

        const chainId = 'chain-' + Date.now();
        const newChain: QuestChain = {
          id: chainId,
          userId: user.id,
          title: input.title,
          description: input.description || '',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const newSteps: QuestChainStep[] = [];

        for (let i = 0; i < input.steps.length; i++) {
          const stepItem = input.steps[i];
          let questId = stepItem.questId;

          if (!questId) {
            const newQuest: Quest = {
              id: 'quest-chain-' + Date.now() + '-' + (i + 1),
              userId: user.id,
              characterId: 'char-demo',
              title: stepItem.title,
              description: stepItem.description || '',
              category: stepItem.category,
              difficulty: stepItem.difficulty,
              xpReward: DIFFICULTY_XP_MAP[stepItem.difficulty] || 50,
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            rawQuests.push(newQuest);
            questId = newQuest.id;
          }

          newSteps.push({
            id: 'step-' + Date.now() + '-' + (i + 1),
            chainId,
            questId,
            stepOrder: i + 1,
            status: i === 0 ? 'AVAILABLE' : 'LOCKED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        localStorage.setItem(questsKey, JSON.stringify(rawQuests));
        localStorage.setItem(stepsKey, JSON.stringify([...rawSteps, ...newSteps]));
        localStorage.setItem(chainsKey, JSON.stringify([newChain, ...rawChains]));

        await fetchChains();
        const created = await getChainById(chainId);
        return { success: true, chain: created || undefined };
      }
    } catch {
      return { success: false, error: 'An unexpected error occurred creating chain.' };
    }
  };

  return {
    chains,
    loading,
    error,
    fetchChains,
    getChainById,
    createChain,
  };
}
