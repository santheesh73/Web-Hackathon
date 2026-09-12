-- LIFE RPG Phase 3: Quests and Progression Migration

-- 1. Extend characters table with xp and level
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- 2. Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3 AND char_length(trim(title)) <= 80),
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Health', 'Learning', 'Career', 'Finance', 'Personal', 'Creativity')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON public.quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_character_id ON public.quests(character_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON public.quests(status);

-- Enable Row Level Security
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quests"
  ON public.quests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
  ON public.quests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
  ON public.quests FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Automatic updated_at trigger for quests
DROP TRIGGER IF EXISTS tr_quests_updated_at ON public.quests;
CREATE TRIGGER tr_quests_updated_at
  BEFORE UPDATE ON public.quests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Deterministic Level Calculator Function in PostgreSQL
CREATE OR REPLACE FUNCTION public.calculate_character_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF p_xp < 100 THEN RETURN 1;
  ELSIF p_xp < 250 THEN RETURN 2;
  ELSIF p_xp < 450 THEN RETURN 3;
  ELSIF p_xp < 700 THEN RETURN 4;
  ELSIF p_xp < 1000 THEN RETURN 5;
  ELSE RETURN 6 + FLOOR((p_xp - 1000) / 350)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Atomic Quest Completion Function / Stored Procedure
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quest RECORD;
  v_character RECORD;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_leveled_up BOOLEAN;
BEGIN
  -- 1. Fetch active quest belonging to current authenticated user
  SELECT * INTO v_quest
  FROM public.quests
  WHERE id = p_quest_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or unauthorized' USING ERRCODE = 'P0002';
  END IF;

  IF v_quest.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Quest already completed' USING ERRCODE = 'P0003';
  END IF;

  -- 2. Mark quest completed atomically
  UPDATE public.quests
  SET status = 'COMPLETED',
      completed_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_quest_id;

  -- 3. Fetch character
  SELECT * INTO v_character
  FROM public.characters
  WHERE id = v_quest.character_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated character not found' USING ERRCODE = 'P0002';
  END IF;

  -- 4. Calculate new XP and Level
  v_old_level := v_character.level;
  v_new_xp := v_character.xp + v_quest.xp_reward;
  v_new_level := public.calculate_character_level(v_new_xp);
  v_leveled_up := v_new_level > v_old_level;

  -- 5. Update character XP and level
  UPDATE public.characters
  SET xp = v_new_xp,
      level = v_new_level,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- 6. Return structured result
  RETURN jsonb_build_object(
    'quest_id', p_quest_id,
    'xp_awarded', v_quest.xp_reward,
    'previous_level', v_old_level,
    'new_level', v_new_level,
    'new_xp', v_new_xp,
    'leveled_up', v_leveled_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
