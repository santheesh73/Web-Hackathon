'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import type { Quest, QuestCompletionResult, QuestStatus } from '@/../src/shared/types/quest';
import type { QuestCreationInput } from '@/../src/shared/schemas/quest';
import { QuestCreationSchema } from '@/../src/shared/schemas/quest';
import { getXpForDifficulty, getLevelFromXp } from '@/features/progression/level-engine';
import {
  getGoldForDifficulty,
  getGoldForBossDifficulty,
  CHAIN_COMPLETION_GOLD,
} from '@/../src/shared/constants/economy';

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

        const bossDefeat = data.boss_defeat
          ? {
              bossId: data.boss_defeat.boss_id,
              bossTitle: data.boss_defeat.boss_title,
              difficulty: data.boss_defeat.difficulty,
              rewardXp: data.boss_defeat.reward_xp,
              completedAt: data.boss_defeat.completed_at,
              defeated: true,
            }
          : null;

        return {
          success: true,
          result: {
            quest: updatedQuest || ({} as Quest),
            xpAwarded: data.xp_awarded,
            goldAwarded: data.gold_awarded,
            totalGold: data.total_gold,
            character: character!,
            previousLevel: data.previous_level,
            newLevel: data.new_level,
            leveledUp: data.leveled_up,
            bossDefeat,
          } as any,
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

        // Chain step locked check (Local storage mode)
        const stepsKey = `life_rpg_chain_steps_${user.id}`;
        const storedSteps = localStorage.getItem(stepsKey);
        const chainSteps: any[] = storedSteps ? JSON.parse(storedSteps) : [];
        const attachedStep = chainSteps.find((s) => s.questId === questId);

        if (attachedStep && attachedStep.status === 'LOCKED') {
          return { success: false, error: 'Cannot complete locked quest chain step. Complete preceding steps first.' };
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

        // 3. Streak processing (Local storage mode)
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        const streakKey = `life_rpg_streak_${user.id}`;
        const actKey = `life_rpg_activities_${user.id}`;
        const storedStreak = localStorage.getItem(streakKey);
        const storedActs = localStorage.getItem(actKey);

        const streakObj = storedStreak ? JSON.parse(storedStreak) : { currentStreak: 0, longestStreak: 0, recoveryAvailable: true };
        const actList: any[] = storedActs ? JSON.parse(storedActs) : [];
        const existingToday = actList.find((a) => a.activityDate === todayStr);

        let firstToday = false;
        let streakExtended = false;
        let isNewRecord = false;
        let newStreakCount = streakObj.currentStreak;

        if (!existingToday) {
          firstToday = true;
          if (streakObj.lastActivityDate === yesterdayStr) {
            newStreakCount = streakObj.currentStreak + 1;
            streakExtended = true;
          } else {
            newStreakCount = 1;
            streakExtended = false;
          }
          isNewRecord = newStreakCount > (streakObj.longestStreak || 0);
          streakObj.longestStreak = Math.max(streakObj.longestStreak || 0, newStreakCount);
          streakObj.currentStreak = newStreakCount;
          streakObj.lastActivityDate = todayStr;

          actList.push({
            id: 'act-' + Date.now(),
            userId: user.id,
            activityDate: todayStr,
            questsCompleted: 1,
            isRecovery: false,
            createdAt: new Date().toISOString(),
          });
        } else {
          existingToday.questsCompleted += 1;
        }

        localStorage.setItem(streakKey, JSON.stringify(streakObj));
        localStorage.setItem(actKey, JSON.stringify(actList));

        // 4. Quest Chain step unlock (Local storage mode)
        let chainProgress = null;
        if (attachedStep) {
          attachedStep.status = 'COMPLETED';
          attachedStep.updatedAt = new Date().toISOString();

          const allChainSteps = chainSteps.filter((s) => s.chainId === attachedStep.chainId);
          const nextStep = allChainSteps.find((s) => s.stepOrder === attachedStep.stepOrder + 1);
          let isChainCompleted = false;

          if (nextStep) {
            nextStep.status = 'AVAILABLE';
            nextStep.updatedAt = new Date().toISOString();
          } else {
            isChainCompleted = true;
            const chainsKey = `life_rpg_chains_${user.id}`;
            const storedChains: any[] = JSON.parse(localStorage.getItem(chainsKey) || '[]');
            const ch = storedChains.find((c) => c.id === attachedStep.chainId);
            if (ch) {
              ch.status = 'COMPLETED';
              localStorage.setItem(chainsKey, JSON.stringify(storedChains));
            }
          }

          localStorage.setItem(stepsKey, JSON.stringify(chainSteps));

          chainProgress = {
            chainId: attachedStep.chainId,
            chainTitle: 'Active Chain',
            completedStepOrder: attachedStep.stepOrder,
            totalSteps: allChainSteps.length,
            completedSteps: allChainSteps.filter((s) => s.status === 'COMPLETED').length,
            isChainCompleted,
            nextStepOrder: nextStep?.stepOrder,
          };
        }

        // 5. Boss Objective and Defeat Processing (Local storage mode)
        let bossDefeat = null;
        const bossLinksKey = `life_rpg_boss_links_${user.id}`;
        const bossObjsKey = `life_rpg_boss_objectives_${user.id}`;
        const bossesKey = `life_rpg_boss_quests_${user.id}`;

        const storedBossLinks = JSON.parse(localStorage.getItem(bossLinksKey) || '[]');
        const storedBossObjs = JSON.parse(localStorage.getItem(bossObjsKey) || '[]');
        const storedBosses = JSON.parse(localStorage.getItem(bossesKey) || '[]');

        const linkedLinks = storedBossLinks.filter((l: any) => l.questId === questId);
        for (const link of linkedLinks) {
          const obj = storedBossObjs.find((o: any) => o.id === link.objectiveId);
          if (obj) {
            const boss = storedBosses.find((b: any) => b.id === obj.bossId);
            if (boss && boss.status === 'ACTIVE') {
              const bossObjs = storedBossObjs.filter((o: any) => o.bossId === boss.id);
              const allObjsCompleted =
                bossObjs.length > 0 &&
                bossObjs.every((o: any) => {
                  const linksForObj = storedBossLinks.filter((l: any) => l.objectiveId === o.id);
                  const completedLinkedQuests = linksForObj.filter((l: any) => {
                    const q = list.find((item: any) => item.id === l.questId);
                    return q && q.status === 'COMPLETED';
                  });
                  return completedLinkedQuests.length >= (o.requiredProgress || 1);
                });

              if (allObjsCompleted) {
                boss.status = 'COMPLETED';
                boss.completedAt = new Date().toISOString();
                boss.updatedAt = new Date().toISOString();
                localStorage.setItem(bossesKey, JSON.stringify(storedBosses));

                const bossXpReward = boss.rewardXp || 250;
                charObj.xp = (charObj.xp || 0) + bossXpReward;
                const levelAfterBoss = getLevelFromXp(charObj.xp);
                if (levelAfterBoss > charObj.level) {
                  charObj.level = levelAfterBoss;
                }
                charObj.updatedAt = new Date().toISOString();

                bossDefeat = {
                  bossId: boss.id,
                  bossTitle: boss.title,
                  difficulty: boss.difficulty,
                  rewardXp: bossXpReward,
                  completedAt: boss.completedAt,
                  defeated: true,
                };
              }
            }
          }
        }

        // 6. Gold rewards & transaction recording (Local storage mode)
        const questGold = getGoldForDifficulty(target.difficulty);
        const chainGold = chainProgress?.isChainCompleted ? CHAIN_COMPLETION_GOLD : 0;
        const bossGold = bossDefeat ? getGoldForBossDifficulty(bossDefeat.difficulty) : 0;
        const totalGoldAwarded = questGold + chainGold + bossGold;

        const currentGold = charObj.gold || 0;
        charObj.gold = currentGold + totalGoldAwarded;

        const txKey = `life_rpg_transactions_${user.id}`;
        const storedTxs = JSON.parse(localStorage.getItem(txKey) || '[]');
        const nowIso = new Date().toISOString();

        storedTxs.unshift({
          id: 'tx-' + Date.now(),
          characterId: charObj.id,
          userId: user.id,
          type: 'EARN',
          amount: questGold,
          balanceAfter: currentGold + questGold,
          source: 'QUEST_COMPLETION',
          referenceId: target.id,
          description: `Earned from quest: ${target.title}`,
          createdAt: nowIso,
        });

        if (chainGold > 0 && chainProgress) {
          storedTxs.unshift({
            id: 'tx-' + (Date.now() + 1),
            characterId: charObj.id,
            userId: user.id,
            type: 'EARN',
            amount: chainGold,
            balanceAfter: currentGold + questGold + chainGold,
            source: 'CHAIN_COMPLETION',
            referenceId: chainProgress.chainId,
            description: `Bonus for completing quest chain: ${chainProgress.chainTitle}`,
            createdAt: nowIso,
          });
        }

        if (bossGold > 0 && bossDefeat) {
          storedTxs.unshift({
            id: 'tx-' + (Date.now() + 2),
            characterId: charObj.id,
            userId: user.id,
            type: 'EARN',
            amount: bossGold,
            balanceAfter: charObj.gold,
            source: 'BOSS_COMPLETION',
            referenceId: bossDefeat.bossId,
            description: `Bounty for defeating boss: ${bossDefeat.bossTitle}`,
            createdAt: nowIso,
          });
        }

        localStorage.setItem(txKey, JSON.stringify(storedTxs));
        localStorage.setItem(charKey, JSON.stringify(charObj));
        localStorage.setItem(key, JSON.stringify(list));

        setQuests([...list]);
        await fetchCharacter(user.id);

        return {
          success: true,
          result: {
            quest: target,
            xpAwarded: target.xpReward,
            goldAwarded: totalGoldAwarded,
            totalGold: charObj.gold,
            bonusGold: chainGold + bossGold,
            character: charObj,
            previousLevel,
            newLevel: charObj.level,
            leveledUp: charObj.level > previousLevel,
            streak: {
              currentStreak: streakObj.currentStreak,
              longestStreak: streakObj.longestStreak,
              firstToday,
              streakExtended,
              isNewRecord,
            },
            chainProgress,
            bossDefeat,
          } as any,
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
