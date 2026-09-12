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

### `public.character_attributes` (Phase 5)
Stores lifestyle discipline progression for each of the 6 core attributes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique attribute identifier |
| `character_id` | `UUID` | `NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE` | Parent character ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.characters(user_id) ON DELETE CASCADE` | Owner user ID |
| `attribute_key` | `VARCHAR(30)` | `CHECK IN ('STRENGTH', 'INTELLIGENCE', 'DISCIPLINE', 'WISDOM', 'CREATIVITY', 'RESILIENCE')` | Discipline identifier |
| `xp` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (xp >= 0)` | Attribute XP gained |
| `level` | `INTEGER` | `NOT NULL DEFAULT 1 CHECK (level >= 1)` | Current attribute level |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

**Constraint**: `UNIQUE(character_id, attribute_key)` guarantees exactly one tracker per attribute per character.

---

### `public.character_skills` (Phase 5)
Stores permanently unlocked capability nodes from the skill tree.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique unlock record ID |
| `character_id` | `UUID` | `NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE` | Parent character ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES public.characters(user_id) ON DELETE CASCADE` | Owner user ID |
| `skill_id` | `VARCHAR(50)` | `NOT NULL` | Static skill identifier |
| `unlocked_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Attunement timestamp |

**Constraint**: `UNIQUE(character_id, skill_id)` prevents duplicate skill purchases.

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

### `calculate_attribute_level(p_xp INTEGER) -> INTEGER` (Phase 5)
Deterministic attribute level curve:
- Level 1: 0–49 XP
- Level 2: 50–149 XP
- Level 3: 150–299 XP
- Level 4: 300–499 XP
- Level 5: 500–749 XP
- Level 6+: `6 + FLOOR((p_xp - 750) / 250)`

### `calculate_evolution_tier(p_level INT, p_skills INT, p_max_attr INT) -> INTEGER` (Phase 5)
Calculates character ascension tier (1 to 4):
- Tier 4 (Paragon): Level $\ge$ 20, Skills $\ge$ 10, Max Attribute Level $\ge$ 7
- Tier 3 (Master): Level $\ge$ 10, Skills $\ge$ 6, Max Attribute Level $\ge$ 5
- Tier 2 (Adept): Level $\ge$ 5, Skills $\ge$ 3, Max Attribute Level $\ge$ 3
- Tier 1 (Initiate): Default baseline

### `unlock_skill(p_skill_id, p_sp_cost, p_required_attr_level, p_attr_key) -> JSONB` (Phase 5)
Server-authoritative skill attunement:
1. Asserts skill not already unlocked.
2. Asserts character has sufficient available skill points (`skill_points >= sp_cost`).
3. Asserts required attribute level prerequisite is satisfied.
4. Deducts SP, records unlock in `character_skills`.
5. Recalculates evolution tier and title.
6. Returns consolidated unlock status.

### `recover_streak() -> JSONB`
Server-controlled procedure to restore a streak when exactly 1 day was missed.

### `complete_quest(p_quest_id UUID) -> JSONB`
Atomic multi-system transaction (Updated Phase 6):
1. Validates quest is `ACTIVE`.
2. Validates linked quest chain step (if any) is `AVAILABLE` (rejects locked steps with `P0006`).
3. Sets quest status `COMPLETED`.
4. Increments character XP and calculates new level (+1 SP if character leveled up).
5. Maps quest category to attribute key, awards attribute XP, and calculates new attribute level (+1 SP if attribute leveled up).
6. Updates character `skill_points`.
7. Recalculates character evolution tier and title.
8. Upserts daily activity into `streak_activities`. Increments or resets streak.
9. If part of a chain: marks step `COMPLETED`, unlocks step $N+1$ (`AVAILABLE`), or marks chain `COMPLETED`.
10. **Boss Integration**:
    - Checks all linked Boss objectives (`boss_objective_quests`).
    - Recalculates completed objectives count based on required progress threshold.
    - If all objectives of an `ACTIVE` Boss are completed:
      - Marks Boss `COMPLETED`.
      - Awards Boss `reward_xp` to character.
      - Recalculates character level, skill points, and evolution rank.
      - Includes `boss_defeat` object in the returned JSONB payload.
11. Returns consolidated progression payload.

---

## Phase 6 Tables

### `public.boss_quests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary Key |
| `character_id` | UUID | FK -> `characters(id)` ON DELETE CASCADE | Character ownership |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | Auth user ownership |
| `title` | VARCHAR(100) | NOT NULL | Goal title |
| `description` | TEXT | NULLABLE | Detailed goal description |
| `difficulty` | VARCHAR(20) | CHECK in ('Rare', 'Epic', 'Legendary') | Fixed difficulty tier |
| `status` | VARCHAR(20) | DEFAULT 'ACTIVE' CHECK in ('ACTIVE', 'COMPLETED', 'ARCHIVED') | Encounter status |
| `deadline` | DATE | NULLABLE | Optional milestone target date |
| `reward_xp` | INT | NOT NULL, CHECK > 0 | Server-authoritative XP bounty |
| `created_at` | TIMESTAMPTZ | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |
| `completed_at` | TIMESTAMPTZ | NULLABLE | Defeat timestamp |

### `public.boss_objectives`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary Key |
| `boss_id` | UUID | FK -> `boss_quests(id)` ON DELETE CASCADE | Parent Boss reference |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | Auth user ownership |
| `title` | VARCHAR(100) | NOT NULL | Objective title |
| `description` | TEXT | NULLABLE | Objective criteria |
| `display_order` | INT | NOT NULL DEFAULT 1 | Sequential ordering |
| `required_progress` | INT | NOT NULL DEFAULT 1, CHECK > 0 | Required quests count |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Update timestamp |

### `public.boss_objective_quests`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary Key |
| `objective_id` | UUID | FK -> `boss_objectives(id)` ON DELETE CASCADE | Objective reference |
| `quest_id` | UUID | FK -> `quests(id)` ON DELETE CASCADE | Normal quest reference |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | User ownership |
| `created_at` | TIMESTAMPTZ | NOT NULL | Link timestamp |
| *Constraint* | UNIQUE | `(objective_id, quest_id)` | Duplicate link prevention |

---

## Phase 7 Tables & Economy System

### `public.characters` (Updated)
Added canonical currency balance:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `gold` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (gold >= 0)` | Earned virtual currency balance |

### `public.shop_items`
Curated marketplace catalog for non-consumable rewards:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Item ID |
| `key` | VARCHAR(100) | `UNIQUE NOT NULL` | Stable program key |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `description` | TEXT | NOT NULL | Item description |
| `category` | VARCHAR(20) | CHECK in ('AVATAR', 'THEME', 'BADGE', 'COSMETIC') | Item category |
| `price` | INTEGER | NOT NULL CHECK (price >= 0) | Server-authoritative Gold cost |
| `icon` | VARCHAR(50) | NULLABLE | Lucide icon identifier |
| `preview_color` | VARCHAR(20) | NULLABLE | Accent hex color |
| `rarity` | VARCHAR(20) | CHECK in ('COMMON', 'RARE', 'EPIC', 'LEGENDARY') | Item rarity |
| `metadata` | JSONB | DEFAULT '{}' | Extensible metadata |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Catalog availability flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Update timestamp |

### `public.purchases`
Immutable record of item ownership:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary Key |
| `character_id` | UUID | FK -> `characters(id)` ON DELETE CASCADE | Character owner |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | User owner |
| `item_id` | UUID | FK -> `shop_items(id)` ON DELETE RESTRICT | Purchased item |
| `price_paid` | INTEGER | NOT NULL CHECK (price_paid >= 0) | Exact gold price paid |
| `purchased_at` | TIMESTAMPTZ | NOT NULL | Transaction timestamp |
| *Constraint* | UNIQUE | `(character_id, item_id)` | Strict duplicate purchase prevention |

### `public.economy_transactions`
Immutable audit ledger for all currency events:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Primary Key |
| `character_id` | UUID | FK -> `characters(id)` ON DELETE CASCADE | Character ID |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | User ID |
| `type` | VARCHAR(10) | CHECK in ('EARN', 'SPEND') | Transaction type |
| `amount` | INTEGER | NOT NULL CHECK (amount > 0) | Gold amount transferred |
| `balance_after` | INTEGER | NOT NULL CHECK (balance_after >= 0) | Balance snapshot post-action |
| `source` | VARCHAR(30) | CHECK in ('QUEST_COMPLETION', 'CHAIN_COMPLETION', 'BOSS_COMPLETION', 'SHOP_PURCHASE', 'SYSTEM_GRANT', 'MILESTONE_BONUS') | Source trigger |
| `reference_id` | UUID | NULLABLE | Origin ID (quest, purchase, boss) |
| `description` | TEXT | NULLABLE | Human-readable log narrative |
| `created_at` | TIMESTAMPTZ | NOT NULL | Immutable ledger timestamp |

### Stored Procedure: `public.purchase_shop_item(p_item_id UUID) -> JSONB`
1. Authenticates caller (`auth.uid()`).
2. Locks character profile with `SELECT * FROM characters WHERE user_id = auth.uid() FOR UPDATE`.
3. Verifies item exists and is active.
4. Enforces duplicate check: throws `409 Item already owned` if previously purchased.
5. Enforces balance check: throws `400 Insufficient gold` if `character.gold < item.price`.
6. Deducts `gold = gold - item.price`.
7. Inserts record into `purchases`.
8. Inserts `SPEND` ledger entry into `economy_transactions`.
9. Returns structured `{ success: true, purchase, remaining_gold, item }`.

---

## Phase 8 Tables & Equipment System

### `public.character_equipment`
Stores active loadout slot assignments for each character. Customization only — zero combat equipment.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Equipment entry ID |
| `character_id` | UUID | FK -> `characters(id)` ON DELETE CASCADE | Character owner |
| `user_id` | UUID | FK -> `auth.users(id)` ON DELETE CASCADE | User owner |
| `slot` | VARCHAR(20) | CHECK in ('AVATAR', 'THEME', 'BADGE', 'COSMETIC') | Equipment slot |
| `item_id` | UUID | FK -> `shop_items(id)` ON DELETE CASCADE | Equipped shop item |
| `purchase_id` | UUID | FK -> `purchases(id)` ON DELETE CASCADE | Verified purchase ownership reference |
| `equipped_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Equipped timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Update timestamp |
| *Constraint* | UNIQUE | `(character_id, slot)` | Enforces exactly 1 item per slot per character |

### Stored Procedure: `public.equip_item(p_item_id UUID) -> JSONB`
1. Authenticates caller (`auth.uid()`).
2. Verifies character exists.
3. Verifies active shop item exists.
4. Validates target slot based on item category (`AVATAR`, `THEME`, `BADGE`, `COSMETIC`).
5. Enforces ownership: verifies caller has a valid purchase record in `purchases` for `(character_id, item_id)`. Rejects unowned equip attempts.
6. Performs atomic UPSERT on `character_equipment(character_id, slot)`:
   - If slot is empty: inserts new equipment assignment.
   - If slot is occupied: replaces the existing item with the new item without deleting the previous item from inventory.
7. Returns `{ success: true, equipped: { itemId, slot, name }, replacedItemId: previous_item_id | null }`.

### Stored Procedure: `public.unequip_item(p_slot VARCHAR) -> JSONB`
1. Authenticates caller (`auth.uid()`).
2. Validates slot name.
3. Checks if item is currently equipped in `character_equipment(character_id, slot)`.
4. Deletes equipment assignment for slot.
5. Returns `{ success: true, unequipped: { itemId, slot, name } }`.

