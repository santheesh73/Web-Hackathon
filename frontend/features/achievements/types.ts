export * from '@/../src/shared/types/achievement';
export * from '@/../src/shared/constants/achievements';
export * from '@/../src/shared/schemas/achievement';

export type AchievementStatusFilter = 'ALL' | 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED';
export type AchievementCategoryFilter = 'ALL' | import('@/../src/shared/types/achievement').AchievementCategory;
export type AchievementSortOption = 'RECENT' | 'PROGRESS' | 'NAME';

export interface AchievementsUIState {
  achievements: import('@/../src/shared/types/achievement').AchievementWithProgress[];
  summary: import('@/../src/shared/types/achievement').AchievementsSummary;
  loading: boolean;
  error: string | null;
  selectedStatus: AchievementStatusFilter;
  selectedCategory: AchievementCategoryFilter;
  searchQuery: string;
  sortBy: AchievementSortOption;
}
