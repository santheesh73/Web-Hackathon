import type {
  AchievementWithProgress,
  AchievementsSummary,
  AchievementCategory,
} from '@/../src/shared/types/achievement';
import type {
  AchievementStatusFilter,
  AchievementCategoryFilter,
  AchievementSortOption,
} from './types';

export function filterAndSortAchievements(
  achievements: AchievementWithProgress[],
  status: AchievementStatusFilter,
  category: AchievementCategoryFilter,
  search: string,
  sortBy: AchievementSortOption
): AchievementWithProgress[] {
  let result = [...achievements];

  // 1. Status Filter
  if (status !== 'ALL') {
    if (status === 'UNLOCKED') {
      result = result.filter((a) => a.isUnlocked);
    } else if (status === 'IN_PROGRESS') {
      result = result.filter((a) => !a.isUnlocked && a.progress > 0);
    } else if (status === 'LOCKED') {
      result = result.filter((a) => !a.isUnlocked && a.progress === 0);
    }
  }

  // 2. Category Filter
  if (category !== 'ALL') {
    result = result.filter((a) => a.category === category);
  }

  // 3. Search Query Filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  // 4. Sort
  result.sort((a, b) => {
    switch (sortBy) {
      case 'NAME':
        return a.name.localeCompare(b.name);
      case 'PROGRESS':
        return b.progressPercent - a.progressPercent;
      case 'RECENT':
      default: {
        // Unlocked first, sorted by unlocked date descending
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        if (a.isUnlocked && b.isUnlocked) {
          return new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime();
        }
        // In-progress next, sorted by progress percent descending
        return b.progressPercent - a.progressPercent;
      }
    }
  });

  return result;
}

export function calculateAchievementSummary(
  achievements: AchievementWithProgress[]
): AchievementsSummary {
  const total = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const inProgressCount = achievements.filter((a) => !a.isUnlocked && a.progress > 0).length;
  const lockedCount = achievements.filter((a) => !a.isUnlocked && a.progress === 0).length;
  const completionPercent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return {
    total,
    unlockedCount,
    inProgressCount,
    lockedCount,
    completionPercent,
  };
}
