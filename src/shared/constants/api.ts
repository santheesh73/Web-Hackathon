export const API_ROUTES = {
  HEALTH: '/health',
  CHARACTER: '/character',
  QUESTS: '/quests',
  QUEST_COMPLETION: '/quest-completion',
  PROGRESSION: '/progression',
} as const;

export const DEFAULT_PORTS = {
  FRONTEND: 3000,
  BACKEND: 4000,
} as const;
