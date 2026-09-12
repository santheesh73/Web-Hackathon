'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type {
  Streak,
  StreakActivity,
  StreakCalendarDay,
  StreakStatus,
  StreakRecoveryResult,
} from '@/../src/shared/types/streak';
import {
  calculateStreakStatus,
  getUtcTodayString,
  getUtcYesterdayString,
  getUtcDayBeforeYesterdayString,
} from './streak-engine';

const LOCAL_STORAGE_STREAK_PREFIX = 'life_rpg_streak_';
const LOCAL_STORAGE_ACTIVITIES_PREFIX = 'life_rpg_activities_';

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = React.useState<Streak | null>(null);
  const [calendarDays, setCalendarDays] = React.useState<StreakCalendarDay[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [recovering, setRecovering] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchStreak = React.useCallback(async () => {
    if (!user) {
      setStreak(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: sErr } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (sErr) {
          setError(sErr.message);
          setLoading(false);
          return;
        }

        if (data) {
          setStreak({
            id: data.id,
            userId: data.user_id,
            currentStreak: data.current_streak,
            longestStreak: data.longest_streak,
            lastActivityDate: data.last_activity_date || undefined,
            recoveryAvailable: data.recovery_available,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        } else {
          // Initialize baseline
          setStreak({
            id: 'streak-' + user.id,
            userId: user.id,
            currentStreak: 0,
            longestStreak: 0,
            recoveryAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // LocalStorage fallback
        const key = `${LOCAL_STORAGE_STREAK_PREFIX}${user.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          setStreak(JSON.parse(stored));
        } else {
          const baseline: Streak = {
            id: 'streak-' + user.id,
            userId: user.id,
            currentStreak: 0,
            longestStreak: 0,
            recoveryAvailable: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(key, JSON.stringify(baseline));
          setStreak(baseline);
        }
      }
    } catch {
      setError('Failed to fetch streak data.');
    } finally {
      setLoading(false);
    }
  }, [user, configured]);

  const fetchCalendar = React.useCallback(
    async (days: number = 30): Promise<StreakCalendarDay[]> => {
      if (!user) return [];

      try {
        let activities: StreakActivity[] = [];
        if (configured) {
          const supabase = getSupabaseClient();
          const { data } = await supabase
            .from('streak_activities')
            .select('*')
            .eq('user_id', user.id);

          activities = (data || []).map((row) => ({
            id: row.id,
            userId: row.user_id,
            activityDate: row.activity_date,
            questsCompleted: row.quests_completed,
            isRecovery: row.is_recovery,
            createdAt: row.created_at,
          }));
        } else {
          const key = `${LOCAL_STORAGE_ACTIVITIES_PREFIX}${user.id}`;
          const stored = localStorage.getItem(key);
          activities = stored ? JSON.parse(stored) : [];
        }

        const activityMap = new Map<string, StreakActivity>();
        for (const a of activities) {
          activityMap.set(a.activityDate, a);
        }

        const todayStr = getUtcTodayString();
        const result: StreakCalendarDay[] = [];

        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const record = activityMap.get(dateStr);

          result.push({
            date: dateStr,
            count: record ? record.questsCompleted : 0,
            active: !!record && record.questsCompleted > 0,
            isToday: dateStr === todayStr,
            isRecovery: !!record && record.isRecovery,
          });
        }

        setCalendarDays(result);
        return result;
      } catch {
        return [];
      }
    },
    [user, configured]
  );

  React.useEffect(() => {
    fetchStreak();
    fetchCalendar(30);
  }, [fetchStreak, fetchCalendar]);

  const recoverStreak = async (): Promise<StreakRecoveryResult> => {
    if (!user || !streak) {
      return { success: false, message: 'User not authenticated' };
    }

    setRecovering(true);

    try {
      if (configured) {
        const supabase = getSupabaseClient();
        const { data, error: rpcErr } = await supabase.rpc('recover_streak');

        if (rpcErr) {
          setRecovering(false);
          return { success: false, message: rpcErr.message };
        }

        await fetchStreak();
        await fetchCalendar(30);
        setRecovering(false);

        return {
          success: true,
          message: data.message || 'Streak recovered successfully!',
          recoveredDate: data.recovered_date,
          newStreak: data.new_streak,
          recoveryAvailable: false,
        };
      } else {
        // Local fallback
        const dayBefore = getUtcDayBeforeYesterdayString();
        const yesterday = getUtcYesterdayString();

        if (!streak.recoveryAvailable) {
          setRecovering(false);
          return { success: false, message: 'Recovery shield has already been used.' };
        }

        if (streak.lastActivityDate !== dayBefore) {
          setRecovering(false);
          return {
            success: false,
            message: 'Not eligible: exactly one day must be missed to recover a streak.',
          };
        }

        // Add recovery activity
        const actKey = `${LOCAL_STORAGE_ACTIVITIES_PREFIX}${user.id}`;
        const storedActs = localStorage.getItem(actKey);
        const activities: StreakActivity[] = storedActs ? JSON.parse(storedActs) : [];

        activities.push({
          id: 'act-rec-' + Date.now(),
          userId: user.id,
          activityDate: yesterday,
          questsCompleted: 1,
          isRecovery: true,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem(actKey, JSON.stringify(activities));

        const newStreakCount = streak.currentStreak + 1;
        const updatedStreak: Streak = {
          ...streak,
          currentStreak: newStreakCount,
          longestStreak: Math.max(streak.longestStreak, newStreakCount),
          lastActivityDate: yesterday,
          recoveryAvailable: false,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(`${LOCAL_STORAGE_STREAK_PREFIX}${user.id}`, JSON.stringify(updatedStreak));
        setStreak(updatedStreak);
        await fetchCalendar(30);
        setRecovering(false);

        return {
          success: true,
          message: 'Streak successfully recovered! Your consistency is preserved.',
          recoveredDate: yesterday,
          newStreak: newStreakCount,
          recoveryAvailable: false,
        };
      }
    } catch {
      setRecovering(false);
      return { success: false, message: 'An unexpected error occurred during recovery.' };
    }
  };

  const statusInfo = React.useMemo(() => {
    if (!streak) return { status: 'NONE' as StreakStatus, isAtRisk: false };
    return calculateStreakStatus(streak);
  }, [streak]);

  return {
    streak,
    status: statusInfo.status,
    isAtRisk: statusInfo.isAtRisk,
    calendarDays,
    loading,
    recovering,
    error,
    fetchStreak,
    fetchCalendar,
    recoverStreak,
  };
}
