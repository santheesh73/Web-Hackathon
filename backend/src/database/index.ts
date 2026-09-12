/**
 * Database foundation for Supabase PostgreSQL.
 * Phase 0: Connection setup placeholder. Domain models are introduced in later phases.
 */

export interface DatabaseConfig {
  url?: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    url: process.env.DATABASE_URL,
  };
}
