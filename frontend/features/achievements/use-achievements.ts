'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import type {
  Achievement,
  AchievementWithProgress,
  AchievementsSummary,
} from '@/../src/shared/types/achievement';
import { SEED_ACHIEVEMENTS } from '@/../src/shared/constants/achievements';
import type {
  AchievementStatusFilter,
  AchievementCategoryFilter,
  AchievementSortOption,
} from './types';
import {
  filterAndSortAchievements,
  calculateAchievementSummary,
} from './achievement-engine';

const ACHIEVEMENTS_STORAGE_PREFIX = 'life_rpg_achievements_';

export function useAchievements() {
  const { user } = useAuth();
  const { character } = useCharacter();

  const [allAchievements, setAllAchievements] = React.useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<AchievementStatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState<AchievementCategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<AchievementSortOption>('RECENT');
  const [newlyUnlocked, setNewlyUnlocked] = React.useState<Achievement[]>([]);

  const configured = isSupabaseConfigured();

  const fetchAchievements = React.useCallback(async () => {
    if (!user) {
      setAllAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (configured && character) {
        const supabase = getSupabaseClient();

        // 1. Evaluate user achievements server-side via RPC
        try {
          const { data: evalData } = await supabase.rpc('evaluate_user_achievements', {
            p_character_id: character.id,
          });
          if (evalData?.newlyUnlocked && evalData.newlyUnlocked.length > 0) {
            setNewlyUnlocked((prev) => [...prev, ...evalData.newlyUnlocked]);
          }
        } catch (rpcErr) {
          console.warn('RPC evaluation skipped or unconfigured:', rpcErr);
        }

        // 2. Fetch all active catalog achievements
        const { data: achData, error: achErr } = await supabase
          .from('achievements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (achErr) {
          setError(achErr.message);
          setLoading(false);
          return;
        }

        // 3. Fetch user's achievement records
        const { data: userAchData } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);

        const userAchMap = new Map<string, any>(
          (userAchData || []).map((ua: any) => [ua.achievement_id, ua])
        );

        const merged: AchievementWithProgress[] = (achData || []).map((row: any) => {
          const userRec = userAchMap.get(row.id);
          const progress = userRec ? userRec.progress : 0;
          const isUnlocked = userRec ? userRec.is_unlocked : false;
          const unlockedAt = userRec ? userRec.unlocked_at : null;
          const progressPercent = isUnlocked
            ? 100
            : Math.min(Math.round((progress / row.target) * 100), 100);

          return {
            id: row.id,
            key: row.key,
            name: row.name,
            description: row.description,
            category: row.category,
            icon: row.icon,
            requirementType: row.requirement_type,
            target: row.target,
            isActive: row.is_active,
            createdAt: row.created_at,
            progress,
            isUnlocked,
            unlockedAt,
            progressPercent,
          };
        });

        setAllAchievements(merged);
      } else {
        // LocalStorage fallback mode
        const achKey = `${ACHIEVEMENTS_STORAGE_PREFIX}${user.id}`;
        const storedMap: Record<string, { progress: number; isUnlocked: boolean; unlockedAt: string | null }> =
          JSON.parse(localStorage.getItem(achKey) || '{}');

        // Derive metrics from localStorage keys
        const quests: any[] = JSON.parse(localStorage.getItem(`life_rpg_quests_${user.id}`) || '[]');
        const streakData: any = JSON.parse(localStorage.getItem(`life_rpg_streak_${user.id}`) || '{}');
        const chains: any[] = JSON.parse(localStorage.getItem(`life_rpg_chains_${user.id}`) || '[]');
        const bosses: any[] = JSON.parse(localStorage.getItem(`life_rpg_bosses_${user.id}`) || '[]');
        const skills: any[] = JSON.parse(localStorage.getItem(`life_rpg_skills_${user.id}`) || '[]');
        const purchases: any[] = JSON.parse(localStorage.getItem(`life_rpg_purchases_${user.id}`) || '[]');
        const equipment: any = JSON.parse(localStorage.getItem(`life_rpg_equipment_${user.id}`) || '{}');

        const completedQuests = quests.filter((q) => q.status === 'COMPLETED').length;
        const streakDays = Math.max(streakData.currentStreak || 0, streakData.longestStreak || 0);
        const completedChains = chains.filter((c) => c.status === 'COMPLETED').length;
        const completedBosses = bosses.filter((b) => b.status === 'COMPLETED').length;
        const playerLevel = character?.level || 1;
        const skillCount = Array.isArray(skills) ? skills.length : 0;
        const itemCount = purchases.length;
        const equippedCount = Object.keys(equipment).length;

        const newUnlocks: Achievement[] = [];
        const now = new Date().toISOString();

        const merged: AchievementWithProgress[] = SEED_ACHIEVEMENTS.map((seed) => {
          let currentProgress = 0;
          switch (seed.requirementType) {
            case 'QUEST_COUNT':
              currentProgress = completedQuests;
              break;
            case 'STREAK_DAYS':
              currentProgress = streakDays;
              break;
            case 'QUEST_CHAIN_COUNT':
              currentProgress = completedChains;
              break;
            case 'BOSS_COMPLETION_COUNT':
              currentProgress = completedBosses;
              break;
            case 'PLAYER_LEVEL':
              currentProgress = playerLevel;
              break;
            case 'SKILL_COUNT':
              currentProgress = skillCount;
              break;
            case 'ITEM_COUNT':
              currentProgress = itemCount;
              break;
            case 'EQUIPPED_ITEM_COUNT':
              currentProgress = equippedCount;
              break;
            default:
              currentProgress = 0;
          }

          const clampedProgress = Math.min(currentProgress, seed.target);
          const existing = storedMap[seed.id];

          let isUnlocked = existing?.isUnlocked || false;
          let unlockedAt = existing?.unlockedAt || null;

          if (!isUnlocked && clampedProgress >= seed.target) {
            isUnlocked = true;
            unlockedAt = now;
            newUnlocks.push(seed);
          }

          storedMap[seed.id] = {
            progress: clampedProgress,
            isUnlocked,
            unlockedAt,
          };

          const progressPercent = isUnlocked
            ? 100
            : Math.min(Math.round((clampedProgress / seed.target) * 100), 100);

          return {
            ...seed,
            progress: clampedProgress,
            isUnlocked,
            unlockedAt,
            progressPercent,
          };
        });

        localStorage.setItem(achKey, JSON.stringify(storedMap));
        setAllAchievements(merged);

        if (newUnlocks.length > 0) {
          setNewlyUnlocked((prev) => [...prev, ...newUnlocks]);
        }
      }
    } catch {
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [user, character, configured]);

  React.useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const clearNewlyUnlocked = React.useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const filteredAchievements = React.useMemo(() => {
    return filterAndSortAchievements(
      allAchievements,
      selectedStatus,
      selectedCategory,
      searchQuery,
      sortBy
    );
  }, [allAchievements, selectedStatus, selectedCategory, searchQuery, sortBy]);

  const summary = React.useMemo(() => {
    return calculateAchievementSummary(allAchievements);
  }, [allAchievements]);

  return {
    achievements: filteredAchievements,
    allAchievements,
    summary,
    loading,
    error,
    selectedStatus,
    setSelectedStatus,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    newlyUnlocked,
    clearNewlyUnlocked,
    refetch: fetchAchievements,
  };
}
