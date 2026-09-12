-- LIFE RPG Phase 2: Characters Migration
-- Table: public.characters
-- Each authenticated user can have exactly one active character.

CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  life_focus TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_characters_user_id UNIQUE (user_id),
  CONSTRAINT chk_characters_name_len CHECK (char_length(trim(name)) >= 3 AND char_length(trim(name)) <= 24)
);

-- Index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);

-- Enable Row Level Security
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can select their own character
CREATE POLICY "Users can view own character"
  ON public.characters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own character
CREATE POLICY "Users can create own character"
  ON public.characters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own character
CREATE POLICY "Users can update own character"
  ON public.characters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_characters_updated_at ON public.characters;
CREATE TRIGGER tr_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
