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

#### Indexes
- `idx_characters_user_id`: Fast lookup on `user_id`.

#### Row Level Security (RLS) Policies
- **SELECT**: `USING (auth.uid() = user_id)` — Users can only read their own character.
- **INSERT**: `WITH CHECK (auth.uid() = user_id)` — Users can only create a character tied to their authenticated ID.
- **UPDATE**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` — Users can only update their own character.

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

#### Indexes
- `idx_quests_user_id`: Filter quests by user.
- `idx_quests_character_id`: Filter quests by character.
- `idx_quests_status`: Quick lookup for ACTIVE vs COMPLETED.

#### Row Level Security (RLS) Policies
- **SELECT**: `USING (auth.uid() = user_id)`
- **INSERT**: `WITH CHECK (auth.uid() = user_id)`
- **UPDATE**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- **DELETE**: `USING (auth.uid() = user_id)`

---

## Stored Procedures & Functions

### `calculate_character_level(p_xp INTEGER) -> INTEGER`
Deterministic level calculation:
- Level 1: 0–99 XP
- Level 2: 100–249 XP
- Level 3: 250–449 XP
- Level 4: 450–699 XP
- Level 5: 700–999 XP
- Level 6+: `6 + FLOOR((p_xp - 1000) / 350)`

### `complete_quest(p_quest_id UUID) -> JSONB`
Atomic stored procedure executing the following within a single transaction:
1. Validates caller ownership (`auth.uid() = user_id`).
2. Asserts quest is currently `ACTIVE`. If already `COMPLETED`, raises exception `P0003` to reject duplicates.
3. Sets `status = 'COMPLETED'` and records `completed_at = now()`.
4. Increments character `xp` by `xp_reward`.
5. Updates character `level = calculate_character_level(new_xp)`.
6. Returns `JSONB` containing `xp_awarded`, `previous_level`, `new_level`, and `leveled_up`.
