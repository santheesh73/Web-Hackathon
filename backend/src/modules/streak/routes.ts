import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type {
  Streak,
  StreakActivity,
  StreakCalendarDay,
  StreakStatus,
} from '../../../../src/shared/types/streak';

// In-memory store for backend test validation and offline execution
export const streaksByUserId = new Map<string, Streak>();
export const streakActivitiesByUserId = new Map<string, StreakActivity[]>();

export function getUtcTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getUtcDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getUtcYesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getUtcDayBeforeYesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 2);
  return d.toISOString().split('T')[0];
}

export function getOrCreateStreak(userId: string): Streak {
  let streak = streaksByUserId.get(userId);
  if (!streak) {
    streak = {
      id: 'streak-' + userId,
      userId,
      currentStreak: 0,
      longestStreak: 0,
      recoveryAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    streaksByUserId.set(userId, streak);
  }
  return streak;
}

export function saveStreak(streak: Streak): void {
  streaksByUserId.set(streak.userId, streak);
}

export function getStreakActivities(userId: string): StreakActivity[] {
  return streakActivitiesByUserId.get(userId) || [];
}

export function saveStreakActivity(activity: StreakActivity): void {
  const list = streakActivitiesByUserId.get(activity.userId) || [];
  const existingIdx = list.findIndex((a) => a.activityDate === activity.activityDate);
  if (existingIdx >= 0) {
    list[existingIdx].questsCompleted += 1;
  } else {
    list.push(activity);
  }
  streakActivitiesByUserId.set(activity.userId, list);
}

export function calculateStreakStatus(streak: Streak): {
  status: StreakStatus;
  isAtRisk: boolean;
} {
  const today = getUtcTodayString();
  const yesterday = getUtcYesterdayString();
  const dayBefore = getUtcDayBeforeYesterdayString();

  if (streak.currentStreak === 0 || !streak.lastActivityDate) {
    return { status: 'NONE', isAtRisk: false };
  }

  if (streak.lastActivityDate === today || streak.lastActivityDate === yesterday) {
    return { status: 'ACTIVE', isAtRisk: false };
  }

  // If last activity was 2 days ago, yesterday was missed: streak is AT_RISK if recovery is available!
  if (streak.lastActivityDate === dayBefore) {
    return {
      status: streak.recoveryAvailable ? 'AT_RISK' : 'BROKEN',
      isAtRisk: streak.recoveryAvailable,
    };
  }

  return { status: 'BROKEN', isAtRisk: false };
}

export const streakRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /streak - retrieve streak summary and current status
  app.get('/streak', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const streak = getOrCreateStreak(userId);
    const { status, isAtRisk } = calculateStreakStatus(streak);
    const activities = getStreakActivities(userId);

    // Count active days in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
    const cutoffStr = thirtyDaysAgo.toISOString().split('T')[0];

    const daysActiveLast30Days = activities.filter(
      (a) => a.activityDate >= cutoffStr && a.questsCompleted > 0
    ).length;

    return reply.status(200).send({
      streak,
      status,
      isAtRisk,
      daysActiveLast30Days,
    });
  });

  // GET /streak/calendar - retrieve past 30 days activity grid
  app.get<{ Querystring: { days?: string } }>('/streak/calendar', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const requestedDays = Math.min(60, Math.max(7, parseInt(request.query.days || '30', 10)));
    const activities = getStreakActivities(userId);
    const activityMap = new Map<string, StreakActivity>();
    for (const a of activities) {
      activityMap.set(a.activityDate, a);
    }

    const todayStr = getUtcTodayString();
    const calendarDays: StreakCalendarDay[] = [];

    // Generate days from (requestedDays - 1) days ago up to today
    for (let i = requestedDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const record = activityMap.get(dateStr);
      calendarDays.push({
        date: dateStr,
        count: record ? record.questsCompleted : 0,
        active: !!record && record.questsCompleted > 0,
        isToday: dateStr === todayStr,
        isRecovery: !!record && record.isRecovery,
      });
    }

    return reply.status(200).send(calendarDays);
  });

  // POST /streak/recover - server-controlled streak recovery
  app.post('/streak/recover', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const streak = getOrCreateStreak(userId);

    // 1. Check recovery shield available
    if (!streak.recoveryAvailable) {
      return reply.status(409).send({
        error: 'Streak recovery shield has already been used and is not available.',
      });
    }

    // 2. Check user missed exactly yesterday (last activity was 2 days ago)
    const dayBeforeYesterday = getUtcDayBeforeYesterdayString();
    const yesterday = getUtcYesterdayString();

    if (!streak.lastActivityDate || streak.lastActivityDate !== dayBeforeYesterday) {
      return reply.status(400).send({
        error:
          'Not eligible for streak recovery: exactly one day must be missed to use a recovery shield.',
      });
    }

    // 3. Inject recovery activity for yesterday
    saveStreakActivity({
      id: 'activity-recovery-' + Date.now(),
      userId,
      activityDate: yesterday,
      questsCompleted: 1,
      isRecovery: true,
      createdAt: new Date().toISOString(),
    });

    // 4. Update streak state
    const newStreak = streak.currentStreak + 1;
    streak.currentStreak = newStreak;
    streak.longestStreak = Math.max(streak.longestStreak, newStreak);
    streak.lastActivityDate = yesterday;
    streak.recoveryAvailable = false;
    streak.updatedAt = new Date().toISOString();
    saveStreak(streak);

    return reply.status(200).send({
      success: true,
      message: 'Streak successfully recovered! Your consistency is preserved.',
      recoveredDate: yesterday,
      newStreak,
      recoveryAvailable: false,
    });
  });
};
