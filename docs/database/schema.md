# Database Schema

## Overview
Database storage is powered by Supabase PostgreSQL with strict Row Level Security (RLS) and atomic SQL stored procedures for game invariants.

## Tables

### `public.characters`
Stores the single active character profile created during onboarding for each authenticated user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique character identifier |
| `user_id` | `UUID` | `NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE` | Owner account ID |
| `name` | `TEXT` | `NOT NULL`, length 3–24 chars | Public adventurer name |
| `avatar` | `TEXT` | `NOT NULL` | Selected avatar archetype ID |
| `life_focus` | `TEXT` | `NOT NULL` | Primary life domain choice |
| `xp` | `INTEGER` | `NOT NULL DEFAULT 0` | Total accumulated progression XP |
| `level` | `INTEGER` | `NOT NULL DEFAULT 1` | Deterministic level calculated from XP |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Character creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last updated timestamp |

---

### `public.quests`
Stores real-life tasks and goals transformed into RPG quests.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique quest identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Owner user ID |
| `character_id` | `UUID` | `NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE` | Associated character ID |
| `title` | `TEXT` | `NOT NULL`, length 3–80 chars | Quest title |
| `description` | `TEXT` | Optional, max 500 chars | Additional details / notes |
| `category` | `TEXT` | `CHECK (category IN ('Health', 'Learning', 'Career', 'Finance', 'Personal', 'Creativity'))` | Real-life life domain |
| `difficulty` | `TEXT` | `CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))` | Quest challenge tier |
| `xp_reward` | `INTEGER` | `NOT NULL CHECK (xp_reward > 0)` | Server-computed reward (Easy: 25, Medium: 50, Hard: 100) |
| `status` | `TEXT` | `DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED'))` | Quest completion lifecycle state |
| `due_date` | `TIMESTAMPTZ` | Optional | Scheduled completion deadline |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |
| `completed_at` | `TIMESTAMPTZ` | Optional | Timestamp when quest was conquered |

---

### `public.streaks` (Phase 4)
Stores consecutive activity tracking and recovery status for each user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique streak identifier |
| `user_id` | `UUID` | `NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE` | Owner account ID |
| `current_streak` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (current_streak >= 0)` | Current consecutive active days |
| `longest_streak` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (longest_streak >= 0)` | Personal best streak record |
| `last_activity_date` | `DATE` | Optional | UTC calendar date of last qualifying activity |
| `recovery_available` | `BOOLEAN` | `NOT NULL DEFAULT true` | Availability of the streak recovery shield |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

---

### `public.streak_activities` (Phase 4)
Stores distinct calendar dates on which the user completed at least one qualifying quest.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique activity record identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Owner account ID |
| `activity_date` | `DATE` | `NOT NULL` | UTC calendar date (`YYYY-MM-DD`) |
| `quests_completed` | `INTEGER` | `NOT NULL DEFAULT 1 CHECK (quests_completed >= 0)` | Number of quests finished on this date |
| `is_recovery` | `BOOLEAN` | `NOT NULL DEFAULT false` | True if record was created via recovery shield |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record timestamp |

**Constraint**: `UNIQUE(user_id, activity_date)` ensures idempotency and guarantees multiple quests on the same day count as 1 active day.

---

### `public.quest_chains` (Phase 4)
Stores multi-step goal roadmaps.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique quest chain identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Owner account ID |
| `title` | `TEXT` | `NOT NULL`, length 3–100 chars | Chain roadmap title |
| `description` | `TEXT` | Optional, max 500 chars | Long-term ambition description |
| `status` | `TEXT` | `DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED'))` | Chain completion lifecycle state |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

---

### `public.quest_chain_steps` (Phase 4)
Stores the ordered sequence of quest steps in a chain with sequential locking.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique step identifier |
| `chain_id` | `UUID` | `NOT NULL REFERENCES public.quest_chains(id) ON DELETE CASCADE` | Parent chain ID |
| `quest_id` | `UUID` | `NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE` | Linked quest ID |
| `step_order` | `INTEGER` | `NOT NULL CHECK (step_order >= 1)` | Sequence position in chain (1, 2, ...) |
| `status` | `TEXT` | `DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'AVAILABLE', 'COMPLETED'))` | Step progression state |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

**Constraints**:
- `UNIQUE(chain_id, step_order)` ensures deterministic step numbering.
- `UNIQUE(chain_id, quest_id)` prevents the same quest from appearing twice in a chain.

---

## Stored Procedures & Functions

### `calculate_character_level(p_xp INTEGER) -> INTEGER`
Deterministic level calculation function:
- Level 1: 0–99 XP
- Level 2: 100–249 XP
- Level 3: 250–449 XP
- Level 4: 450–699 XP
- Level 5: 700–999 XP
- Level 6+: `6 + FLOOR((p_xp - 1000) / 350)`

### `recover_streak() -> JSONB`
Server-controlled procedure to restore a streak:
1. Asserts user has missed exactly 1 day (`last_activity_date = yesterday - 1 day`).
2. Asserts `recovery_available = true`.
3. Injects a recovery activity record for yesterday into `streak_activities`.
4. Sets `current_streak = current_streak + 1`, `last_activity_date = yesterday`, `recovery_available = false`.

### `complete_quest(p_quest_id UUID) -> JSONB`
Atomic multi-system transaction:
1. Validates quest is `ACTIVE`.
2. Validates linked quest chain step (if any) is `AVAILABLE` (rejects locked steps with error code `P0006`).
3. Sets quest status `COMPLETED`.
4. Increments character XP and calculates new level.
5. Upserts daily activity into `streak_activities`. If first quest today, checks if yesterday was active &rarr; increments `current_streak` or resets to 1; updates `longest_streak`.
6. If part of a chain: marks step `COMPLETED`, unlocks step $N+1$ (`AVAILABLE`), or marks entire chain `COMPLETED` if final step.
7. Returns consolidated JSON payload.
