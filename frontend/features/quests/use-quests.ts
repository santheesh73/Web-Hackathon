'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import type { Quest, QuestCompletionResult, QuestStatus } from '@/../src/shared/types/quest';
import type { QuestCreationInput } from '@/../src/shared/schemas/quest';
import { QuestCreationSchema } from '@/../src/shared/schemas/quest';
import { getXpForDifficulty, getLevelFromXp } from '@/features/progression/level-engine';

const LOCAL_STORAGE_QUESTS_PREFIX = 'life_rpg_quests_';

export type QuestFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';

export function useQuests() {
  const { user } = useAuth();
  const { character, fetchCharacter } = useCharacter();
  const [quests, setQuests] = React.useState<Quest[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<QuestFilter>('ALL');
  const configured = isSupabaseConfigured();

  const fetchQuests = React.useCallback(async (): Promise<Quest[]> => {
    if (!user) {
      setQuests([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: qErr } = await supabase
          .from('quests')
          .select('*')
          .eq('user_id', user.id)
          .order('status', { ascending: true })
          .order('created_at', { ascending: false });

        if (qErr) {
          setError(qErr.message);
          setLoading(false);
          return [];
        }

        const mapped: Quest[] = (data || []).map((row) => ({
          id: row.id,
          userId: row.user_id,
          characterId: row.character_id,
          title: row.title,
          description: row.description || '',
          category: row.category,
          difficulty: row.difficulty,
          xpReward: row.xp_reward,
          status: row.status,
          dueDate: row.due_date || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          completedAt: row.completed_at || undefined,
        }));

        setQuests(mapped);
        setLoading(false);
        return mapped;
      } else {
        // LocalStorage fallback
        const stored = localStorage.getItem(`${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`);
        const list: Quest[] = stored ? JSON.parse(stored) : [];
        setQuests(list);
        setLoading(false);
        return list;
      }
    } catch {
      setError('Failed to load quests.');
      setLoading(false);
      return [];
    }
  }, [user, configured]);

  React.useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const getQuestById = React.useCallback(
    async (questId: string): Promise<Quest | null> => {
      if (!user) return null;

      try {
        if (configured) {
          const supabase = getSupabaseClient();
          const { data, error: fetchErr } = await supabase
            .from('quests')
            .select('*')
            .eq('id', questId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (fetchErr || !data) return null;

          return {
            id: data.id,
            userId: data.user_id,
            characterId: data.character_id,
            title: data.title,
            description: data.description || '',
            category: data.category,
            difficulty: data.difficulty,
            xpReward: data.xp_reward,
            status: data.status,
            dueDate: data.due_date || undefined,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            completedAt: data.completed_at || undefined,
          };
        } else {
          const stored = localStorage.getItem(`${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`);
          const list: Quest[] = stored ? JSON.parse(stored) : [];
          return list.find((q) => q.id === questId && q.userId === user.id) || null;
        }
      } catch {
        return null;
      }
    },
    [user, configured]
  );

  const createQuest = async (
    input: QuestCreationInput
  ): Promise<{ success: boolean; error?: string; quest?: Quest }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    // Validate input with shared schema
    const validation = QuestCreationSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0]?.message || 'Invalid quest data' };
    }

    // Authoritatively determine XP reward server-side / engine-side
    const xpReward = getXpForDifficulty(input.difficulty);

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // Get character id
        const { data: charData } = await supabase
          .from('characters')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!charData) {
          return { success: false, error: 'No active character found for this account' };
        }

        const { data, error: insertErr } = await supabase
          .from('quests')
          .insert({
            user_id: user.id,
            character_id: charData.id,
            title: input.title,
            description: input.description,
            category: input.category,
            difficulty: input.difficulty,
            xp_reward: xpReward,
            status: 'ACTIVE',
            due_date: input.dueDate || null,
          })
          .select()
          .single();

        if (insertErr) {
          return { success: false, error: insertErr.message };
        }

        const newQuest: Quest = {
          id: data.id,
          userId: data.user_id,
          characterId: data.character_id,
          title: data.title,
          description: data.description || '',
          category: data.category,
          difficulty: data.difficulty,
          xpReward: data.xp_reward,
          status: data.status,
          dueDate: data.due_date || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setQuests((prev) => [newQuest, ...prev]);
        return { success: true, quest: newQuest };
      } else {
        // LocalStorage mode
        const key = `${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`;
        const stored = localStorage.getItem(key);
        const list: Quest[] = stored ? JSON.parse(stored) : [];

        const newQuest: Quest = {
          id: 'quest-' + Date.now(),
          userId: user.id,
          characterId: character?.id || 'char-demo',
          title: input.title,
          description: input.description,
          category: input.category,
          difficulty: input.difficulty,
          xpReward,
          status: 'ACTIVE',
          dueDate: input.dueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updated = [newQuest, ...list];
        localStorage.setItem(key, JSON.stringify(updated));
        setQuests(updated);
        return { success: true, quest: newQuest };
      }
    } catch {
      return { success: false, error: 'Failed to save quest' };
    }
  };

  const completeQuest = async (
    questId: string
  ): Promise<{ success: boolean; error?: string; result?: QuestCompletionResult }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // Use PostgreSQL stored procedure / RPC for atomic completion
        const { data, error: rpcErr } = await supabase.rpc('complete_quest', {
          p_quest_id: questId,
        });

        if (rpcErr) {
          return { success: false, error: rpcErr.message };
        }

        // Refresh character and quests
        await fetchCharacter(user.id);
        await fetchQuests();

        const updatedQuest = quests.find((q) => q.id === questId);

        return {
          success: true,
          result: {
            quest: updatedQuest || ({} as Quest),
            xpAwarded: data.xp_awarded,
            character: character!,
            previousLevel: data.previous_level,
            newLevel: data.new_level,
            leveledUp: data.leveled_up,
          },
        };
      } else {
        // Local storage atomic completion
        const key = `${LOCAL_STORAGE_QUESTS_PREFIX}${user.id}`;
        const stored = localStorage.getItem(key);
        const list: Quest[] = stored ? JSON.parse(stored) : [];

        const target = list.find((q) => q.id === questId && q.userId === user.id);
        if (!target) {
          return { success: false, error: 'Quest not found' };
        }

        // Invariant: Prevent duplicate completion
        if (target.status === 'COMPLETED') {
          return { success: false, error: 'Quest is already completed' };
        }

        // 1. Mark completed
        target.status = 'COMPLETED';
        target.completedAt = new Date().toISOString();
        target.updatedAt = new Date().toISOString();

        // 2. Award XP and calculate level
        const charKey = `life_rpg_character_${user.id}`;
        const charStored = localStorage.getItem(charKey);
        let charObj = charStored ? JSON.parse(charStored) : { id: 'char-demo', xp: 0, level: 1 };

        const previousLevel = charObj.level || 1;
        const previousXp = charObj.xp || 0;
        const newXp = previousXp + target.xpReward;
        const newLevel = getLevelFromXp(newXp);
        const leveledUp = newLevel > previousLevel;

        charObj = {
          ...charObj,
          xp: newXp,
          level: newLevel,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(charKey, JSON.stringify(charObj));
        localStorage.setItem(key, JSON.stringify(list));

        setQuests([...list]);
        await fetchCharacter(user.id);

        return {
          success: true,
          result: {
            quest: target,
            xpAwarded: target.xpReward,
            character: charObj,
            previousLevel,
            newLevel,
            leveledUp,
          },
        };
      }
    } catch {
      return { success: false, error: 'An unexpected error occurred during completion' };
    }
  };

  const filteredQuests = React.useMemo(() => {
    if (filter === 'ACTIVE') return quests.filter((q) => q.status === 'ACTIVE');
    if (filter === 'COMPLETED') return quests.filter((q) => q.status === 'COMPLETED');
    return quests;
  }, [quests, filter]);

  return {
    quests: filteredQuests,
    allQuests: quests,
    loading,
    error,
    filter,
    setFilter,
    fetchQuests,
    getQuestById,
    createQuest,
    completeQuest,
  };
}
