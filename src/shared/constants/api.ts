export const API_ROUTES = {
  HEALTH: '/health',
  CHARACTER: '/character',
  QUESTS: '/quests',
  QUEST_COMPLETION: '/quest-completion',
  PROGRESSION: '/progression',
  STREAK: '/streak',
  STREAK_CALENDAR: '/streak/calendar',
  STREAK_RECOVER: '/streak/recover',
  QUEST_CHAINS: '/quest-chains',
  ATTRIBUTES: '/character/attributes',
  EVOLUTION: '/character/evolution',
  SKILL_TREE: '/skill-tree',
  SKILL_TREE_UNLOCK: '/skill-tree/unlock',
} as const;

export const DEFAULT_PORTS = {
  FRONTEND: 3000,
  BACKEND: 4000,
} as const;
