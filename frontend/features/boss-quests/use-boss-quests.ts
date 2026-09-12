'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import { useQuests } from '@/features/quests/use-quests';
import type {
  BossQuest,
  BossObjective,
  BossObjectiveQuest,
  BossObjectiveWithQuests,
  BossQuestWithDetails,
  CreateBossQuestInput,
  UpdateBossQuestInput,
  CreateBossObjectiveInput,
  UpdateBossObjectiveInput,
} from './types';
import {
  BOSS_REWARD_MAP,
  calculateObjectiveProgress,
  isObjectiveCompleted,
  calculateBossProgress,
  isBossDefeated,
} from './boss-engine';

const LOCAL_STORAGE_BOSSES_PREFIX = 'life_rpg_boss_quests_';
const LOCAL_STORAGE_OBJECTIVES_PREFIX = 'life_rpg_boss_objectives_';
const LOCAL_STORAGE_LINKS_PREFIX = 'life_rpg_boss_links_';

export function useBossQuests() {
  const { user } = useAuth();
  const { character } = useCharacter();
  const { allQuests, fetchQuests } = useQuests();

  const [bossQuests, setBossQuests] = React.useState<BossQuestWithDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const buildDetailedBoss = React.useCallback(
    (
      boss: BossQuest,
      objectives: BossObjective[],
      links: BossObjectiveQuest[],
      questList = allQuests
    ): BossQuestWithDetails => {
      const bossObjectives = objectives
        .filter((o) => o.bossId === boss.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      const enrichedObjectives: BossObjectiveWithQuests[] = bossObjectives.map((obj) => {
        const objLinks = links.filter((l) => l.objectiveId === obj.id);
        const linkedQuests = objLinks
          .map((l) => questList.find((q) => q.id === l.questId))
          .filter(Boolean) as typeof questList;

        const completedQuestsCount = linkedQuests.filter((q) => q.status === 'COMPLETED').length;
        const progressPercent = calculateObjectiveProgress(completedQuestsCount, obj.requiredProgress);
        const isCompleted = isObjectiveCompleted(completedQuestsCount, obj.requiredProgress);

        return {
          ...obj,
          linkedQuests,
          completedQuestsCount,
          progressPercent,
          isCompleted,
        };
      });

      const totalObjectivesCount = enrichedObjectives.length;
      const completedObjectivesCount = enrichedObjectives.filter((o) => o.isCompleted).length;
      const progressPercent = calculateBossProgress(enrichedObjectives);
      const isDefeated = isBossDefeated(enrichedObjectives);

      return {
        ...boss,
        objectives: enrichedObjectives,
        totalObjectivesCount,
        completedObjectivesCount,
        progressPercent,
        isDefeated,
      };
    },
    [allQuests]
  );

  const fetchBossQuests = React.useCallback(async (): Promise<BossQuestWithDetails[]> => {
    if (!user) {
      setBossQuests([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const [bossRes, objRes, linkRes] = await Promise.all([
          supabase
            .from('boss_quests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase.from('boss_objectives').select('*').eq('user_id', user.id),
          supabase.from('boss_objective_quests').select('*').eq('user_id', user.id),
        ]);

        if (bossRes.error) {
          setError(bossRes.error.message);
          setLoading(false);
          return [];
        }

        const rawBosses: BossQuest[] = (bossRes.data || []).map((r) => ({
          id: r.id,
          characterId: r.character_id,
          userId: r.user_id,
          title: r.title,
          description: r.description || '',
          difficulty: r.difficulty,
          status: r.status,
          deadline: r.deadline || undefined,
          rewardXp: r.reward_xp,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          completedAt: r.completed_at || undefined,
        }));

        const rawObjs: BossObjective[] = (objRes.data || []).map((r) => ({
          id: r.id,
          bossId: r.boss_id,
          userId: r.user_id,
          title: r.title,
          description: r.description || '',
          displayOrder: r.display_order,
          requiredProgress: r.required_progress,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));

        const rawLinks: BossObjectiveQuest[] = (linkRes.data || []).map((r) => ({
          id: r.id,
          objectiveId: r.objective_id,
          questId: r.quest_id,
          userId: r.user_id,
          createdAt: r.created_at,
        }));

        const enriched = rawBosses.map((b) => buildDetailedBoss(b, rawObjs, rawLinks));
        setBossQuests(enriched);
        setLoading(false);
        return enriched;
      } else {
        // LocalStorage fallback
        const bossesKey = `${LOCAL_STORAGE_BOSSES_PREFIX}${user.id}`;
        const objsKey = `${LOCAL_STORAGE_OBJECTIVES_PREFIX}${user.id}`;
        const linksKey = `${LOCAL_STORAGE_LINKS_PREFIX}${user.id}`;

        const bosses: BossQuest[] = JSON.parse(localStorage.getItem(bossesKey) || '[]');
        const objs: BossObjective[] = JSON.parse(localStorage.getItem(objsKey) || '[]');
        const links: BossObjectiveQuest[] = JSON.parse(localStorage.getItem(linksKey) || '[]');

        const enriched = bosses.map((b) => buildDetailedBoss(b, objs, links));
        setBossQuests(enriched);
        setLoading(false);
        return enriched;
      }
    } catch {
      setError('Failed to fetch Boss Quests.');
      setLoading(false);
      return [];
    }
  }, [user, configured, buildDetailedBoss]);

  React.useEffect(() => {
    fetchBossQuests();
  }, [fetchBossQuests]);

  const getBossQuestById = React.useCallback(
    async (bossId: string): Promise<BossQuestWithDetails | null> => {
      const list = await fetchBossQuests();
      return list.find((b) => b.id === bossId) || null;
    },
    [fetchBossQuests]
  );

  const createBossQuest = async (
    input: CreateBossQuestInput
  ): Promise<{ success: boolean; boss?: BossQuestWithDetails; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const rewardXp = BOSS_REWARD_MAP[input.difficulty] ?? 250;
      const now = new Date().toISOString();
      const characterId = character?.id || 'char-demo';

      if (configured) {
        const supabase = getSupabaseClient();
        const { data: bossRow, error: bossErr } = await supabase
          .from('boss_quests')
          .insert({
            character_id: characterId,
            user_id: user.id,
            title: input.title,
            description: input.description || null,
            difficulty: input.difficulty,
            status: 'ACTIVE',
            deadline: input.deadline || null,
            reward_xp: rewardXp,
          })
          .select()
          .single();

        if (bossErr) return { success: false, error: bossErr.message };

        const objectivesToInsert = input.objectives.map((obj, idx) => ({
          boss_id: bossRow.id,
          user_id: user.id,
          title: obj.title,
          description: obj.description || null,
          display_order: idx + 1,
          required_progress: obj.requiredProgress || 1,
        }));

        const { error: objErr } = await supabase.from('boss_objectives').insert(objectivesToInsert);
        if (objErr) return { success: false, error: objErr.message };

        await fetchBossQuests();
        const created = await getBossQuestById(bossRow.id);
        return { success: true, boss: created || undefined };
      } else {
        // LocalStorage mode
        const bossesKey = `${LOCAL_STORAGE_BOSSES_PREFIX}${user.id}`;
        const objsKey = `${LOCAL_STORAGE_OBJECTIVES_PREFIX}${user.id}`;

        const bosses: BossQuest[] = JSON.parse(localStorage.getItem(bossesKey) || '[]');
        const objs: BossObjective[] = JSON.parse(localStorage.getItem(objsKey) || '[]');

        const bossId = 'boss-' + Date.now();
        const newBoss: BossQuest = {
          id: bossId,
          characterId,
          userId: user.id,
          title: input.title,
          description: input.description,
          difficulty: input.difficulty,
          status: 'ACTIVE',
          deadline: input.deadline,
          rewardXp,
          createdAt: now,
          updatedAt: now,
        };

        const newObjs: BossObjective[] = input.objectives.map((o, idx) => ({
          id: 'bobj-' + Date.now() + '-' + idx,
          bossId,
          userId: user.id,
          title: o.title,
          description: o.description,
          displayOrder: idx + 1,
          requiredProgress: o.requiredProgress || 1,
          createdAt: now,
          updatedAt: now,
        }));

        localStorage.setItem(bossesKey, JSON.stringify([newBoss, ...bosses]));
        localStorage.setItem(objsKey, JSON.stringify([...objs, ...newObjs]));

        await fetchBossQuests();
        const detailed = buildDetailedBoss(newBoss, newObjs, []);
        return { success: true, boss: detailed };
      }
    } catch {
      return { success: false, error: 'Failed to create Boss Quest' };
    }
  };

  const updateBossQuest = async (
    bossId: string,
    input: UpdateBossQuestInput
  ): Promise<{ success: boolean; boss?: BossQuestWithDetails; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const target = bossQuests.find((b) => b.id === bossId);
      if (!target) return { success: false, error: 'Boss Quest not found' };
      if (target.status === 'COMPLETED') {
        return { success: false, error: 'Cannot modify a completed Boss Quest' };
      }

      if (configured) {
        const supabase = getSupabaseClient();
        const { error: updErr } = await supabase
          .from('boss_quests')
          .update({
            title: input.title,
            description: input.description,
            deadline: input.deadline,
            status: input.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bossId)
          .eq('user_id', user.id);

        if (updErr) return { success: false, error: updErr.message };

        await fetchBossQuests();
        const updated = await getBossQuestById(bossId);
        return { success: true, boss: updated || undefined };
      } else {
        const bossesKey = `${LOCAL_STORAGE_BOSSES_PREFIX}${user.id}`;
        const bosses: BossQuest[] = JSON.parse(localStorage.getItem(bossesKey) || '[]');
        const idx = bosses.findIndex((b) => b.id === bossId);
        if (idx === -1) return { success: false, error: 'Boss Quest not found' };

        const updatedBoss = {
          ...bosses[idx],
          ...input,
          updatedAt: new Date().toISOString(),
        };
        bosses[idx] = updatedBoss;
        localStorage.setItem(bossesKey, JSON.stringify(bosses));

        await fetchBossQuests();
        return { success: true, boss: await getBossQuestById(bossId) || undefined };
      }
    } catch {
      return { success: false, error: 'Failed to update Boss Quest' };
    }
  };

  const deleteBossQuest = async (bossId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { error: delErr } = await supabase
          .from('boss_quests')
          .delete()
          .eq('id', bossId)
          .eq('user_id', user.id);

        if (delErr) return { success: false, error: delErr.message };
        await fetchBossQuests();
        return { success: true };
      } else {
        const bossesKey = `${LOCAL_STORAGE_BOSSES_PREFIX}${user.id}`;
        const objsKey = `${LOCAL_STORAGE_OBJECTIVES_PREFIX}${user.id}`;
        const linksKey = `${LOCAL_STORAGE_LINKS_PREFIX}${user.id}`;

        const bosses: BossQuest[] = JSON.parse(localStorage.getItem(bossesKey) || '[]');
        const objs: BossObjective[] = JSON.parse(localStorage.getItem(objsKey) || '[]');
        const links: BossObjectiveQuest[] = JSON.parse(localStorage.getItem(linksKey) || '[]');

        const targetObjs = objs.filter((o) => o.bossId === bossId).map((o) => o.id);

        localStorage.setItem(bossesKey, JSON.stringify(bosses.filter((b) => b.id !== bossId)));
        localStorage.setItem(objsKey, JSON.stringify(objs.filter((o) => o.bossId !== bossId)));
        localStorage.setItem(
          linksKey,
          JSON.stringify(links.filter((l) => !targetObjs.includes(l.objectiveId)))
        );

        await fetchBossQuests();
        return { success: true };
      }
    } catch {
      return { success: false, error: 'Failed to delete Boss Quest' };
    }
  };

  const addObjective = async (
    bossId: string,
    input: CreateBossObjectiveInput
  ): Promise<{ success: boolean; objective?: BossObjective; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const boss = bossQuests.find((b) => b.id === bossId);
      if (!boss) return { success: false, error: 'Boss Quest not found' };
      if (boss.status === 'COMPLETED') {
        return { success: false, error: 'Cannot modify objectives of a completed Boss Quest' };
      }

      const displayOrder = input.displayOrder ?? boss.objectives.length + 1;
      const now = new Date().toISOString();

      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: addErr } = await supabase
          .from('boss_objectives')
          .insert({
            boss_id: bossId,
            user_id: user.id,
            title: input.title,
            description: input.description || null,
            display_order: displayOrder,
            required_progress: input.requiredProgress || 1,
          })
          .select()
          .single();

        if (addErr) return { success: false, error: addErr.message };
        await fetchBossQuests();
        return { success: true, objective: data };
      } else {
        const objsKey = `${LOCAL_STORAGE_OBJECTIVES_PREFIX}${user.id}`;
        const objs: BossObjective[] = JSON.parse(localStorage.getItem(objsKey) || '[]');

        const newObj: BossObjective = {
          id: 'bobj-' + Date.now(),
          bossId,
          userId: user.id,
          title: input.title,
          description: input.description,
          displayOrder,
          requiredProgress: input.requiredProgress || 1,
          createdAt: now,
          updatedAt: now,
        };

        localStorage.setItem(objsKey, JSON.stringify([...objs, newObj]));
        await fetchBossQuests();
        return { success: true, objective: newObj };
      }
    } catch {
      return { success: false, error: 'Failed to add objective' };
    }
  };

  const deleteObjective = async (
    bossId: string,
    objectiveId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const boss = bossQuests.find((b) => b.id === bossId);
      if (!boss) return { success: false, error: 'Boss Quest not found' };
      if (boss.status === 'COMPLETED') {
        return { success: false, error: 'Cannot modify objectives of a completed Boss Quest' };
      }

      if (configured) {
        const supabase = getSupabaseClient();
        const { error: delErr } = await supabase
          .from('boss_objectives')
          .delete()
          .eq('id', objectiveId)
          .eq('user_id', user.id);

        if (delErr) return { success: false, error: delErr.message };
        await fetchBossQuests();
        return { success: true };
      } else {
        const objsKey = `${LOCAL_STORAGE_OBJECTIVES_PREFIX}${user.id}`;
        const linksKey = `${LOCAL_STORAGE_LINKS_PREFIX}${user.id}`;

        const objs: BossObjective[] = JSON.parse(localStorage.getItem(objsKey) || '[]');
        const links: BossObjectiveQuest[] = JSON.parse(localStorage.getItem(linksKey) || '[]');

        localStorage.setItem(objsKey, JSON.stringify(objs.filter((o) => o.id !== objectiveId)));
        localStorage.setItem(linksKey, JSON.stringify(links.filter((l) => l.objectiveId !== objectiveId)));

        await fetchBossQuests();
        return { success: true };
      }
    } catch {
      return { success: false, error: 'Failed to delete objective' };
    }
  };

  const linkQuest = async (
    bossId: string,
    objectiveId: string,
    questId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const boss = bossQuests.find((b) => b.id === bossId);
      if (!boss) return { success: false, error: 'Boss Quest not found' };
      if (boss.status === 'COMPLETED') {
        return { success: false, error: 'Cannot link quests to a completed Boss Quest' };
      }

      const obj = boss.objectives.find((o) => o.id === objectiveId);
      if (!obj) return { success: false, error: 'Objective not found' };

      if (obj.linkedQuests.some((q) => q.id === questId)) {
        return { success: false, error: 'Quest is already linked to this objective' };
      }

      if (configured) {
        const supabase = getSupabaseClient();
        const { error: linkErr } = await supabase.from('boss_objective_quests').insert({
          objective_id: objectiveId,
          quest_id: questId,
          user_id: user.id,
        });

        if (linkErr) return { success: false, error: linkErr.message };
        await fetchQuests();
        await fetchBossQuests();
        return { success: true };
      } else {
        const linksKey = `${LOCAL_STORAGE_LINKS_PREFIX}${user.id}`;
        const links: BossObjectiveQuest[] = JSON.parse(localStorage.getItem(linksKey) || '[]');

        const newLink: BossObjectiveQuest = {
          id: 'boq-' + Date.now(),
          objectiveId,
          questId,
          userId: user.id,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(linksKey, JSON.stringify([...links, newLink]));
        await fetchQuests();
        await fetchBossQuests();
        return { success: true };
      }
    } catch {
      return { success: false, error: 'Failed to link quest' };
    }
  };

  const unlinkQuest = async (
    bossId: string,
    objectiveId: string,
    questId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User is not authenticated' };

    try {
      const boss = bossQuests.find((b) => b.id === bossId);
      if (!boss) return { success: false, error: 'Boss Quest not found' };
      if (boss.status === 'COMPLETED') {
        return { success: false, error: 'Cannot unlink quests from a completed Boss Quest' };
      }

      if (configured) {
        const supabase = getSupabaseClient();
        const { error: unErr } = await supabase
          .from('boss_objective_quests')
          .delete()
          .eq('objective_id', objectiveId)
          .eq('quest_id', questId)
          .eq('user_id', user.id);

        if (unErr) return { success: false, error: unErr.message };
        await fetchBossQuests();
        return { success: true };
      } else {
        const linksKey = `${LOCAL_STORAGE_LINKS_PREFIX}${user.id}`;
        const links: BossObjectiveQuest[] = JSON.parse(localStorage.getItem(linksKey) || '[]');

        const filtered = links.filter((l) => !(l.objectiveId === objectiveId && l.questId === questId));
        localStorage.setItem(linksKey, JSON.stringify(filtered));

        await fetchBossQuests();
        return { success: true };
      }
    } catch {
      return { success: false, error: 'Failed to unlink quest' };
    }
  };

  const activeBoss = React.useMemo(() => {
    return bossQuests.find((b) => b.status === 'ACTIVE') || null;
  }, [bossQuests]);

  return {
    bossQuests,
    activeBoss,
    loading,
    error,
    fetchBossQuests,
    getBossQuestById,
    createBossQuest,
    updateBossQuest,
    deleteBossQuest,
    addObjective,
    deleteObjective,
    linkQuest,
    unlinkQuest,
  };
}
