# Database Schema

## Overview
Database storage is powered by Supabase PostgreSQL with strict Row Level Security (RLS).

## Implemented Tables (Phase 2)

### `public.characters`
Stores the single active character profile created during onboarding for each authenticated user.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique character identifier |
| `user_id` | `UUID` | `NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE` | Owner account ID |
| `name` | `TEXT` | `NOT NULL`, length 3–24 chars | Public adventurer name |
| `avatar` | `TEXT` | `NOT NULL` | Selected avatar archetype ID |
| `life_focus` | `TEXT` | `NOT NULL` | Primary life domain choice |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Character creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last updated timestamp |

### Indexes
- `idx_characters_user_id`: Fast lookup on `user_id`.

### Row Level Security (RLS) Policies
- **SELECT**: `USING (auth.uid() = user_id)` — Users can only read their own character.
- **INSERT**: `WITH CHECK (auth.uid() = user_id)` — Users can only create a character tied to their authenticated ID.
- **UPDATE**: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)` — Users can only update their own character.
