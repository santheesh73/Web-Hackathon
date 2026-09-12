-- LIFE RPG Phase 4: Streaks, Streak Activity, and Quest Chains Migration

-- 1. Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  recovery_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create streak_activities table
CREATE TABLE IF NOT EXISTS public.streak_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  quests_completed INTEGER NOT NULL DEFAULT 1 CHECK (quests_completed >= 0),
  is_recovery BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_streak_activities_user_date UNIQUE (user_id, activity_date)
);

-- 3. Create quest_chains table
CREATE TABLE IF NOT EXISTS public.quest_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3 AND char_length(trim(title)) <= 100),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create quest_chain_steps table
CREATE TABLE IF NOT EXISTS public.quest_chain_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.quest_chains(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL CHECK (step_order >= 1),
  status TEXT NOT NULL DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'AVAILABLE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_quest_chain_steps_order UNIQUE (chain_id, step_order),
  CONSTRAINT uq_quest_chain_steps_quest UNIQUE (chain_id, quest_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_activities_user_date ON public.streak_activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_quest_chains_user_id ON public.quest_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_chain_steps_chain_order ON public.quest_chain_steps(chain_id, step_order ASC);
CREATE INDEX IF NOT EXISTS idx_quest_chain_steps_quest_id ON public.quest_chain_steps(quest_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_chain_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for streaks
CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for streak_activities
CREATE POLICY "Users can view own streak activities"
  ON public.streak_activities FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak activities"
  ON public.streak_activities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quest_chains
CREATE POLICY "Users can view own quest chains"
  ON public.quest_chains FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest chains"
  ON public.quest_chains FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest chains"
  ON public.quest_chains FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quest chains"
  ON public.quest_chains FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for quest_chain_steps
CREATE POLICY "Users can view own quest chain steps"
  ON public.quest_chain_steps FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quest_chains qc
    WHERE qc.id = chain_id AND qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own quest chain steps"
  ON public.quest_chain_steps FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quest_chains qc
    WHERE qc.id = chain_id AND qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own quest chain steps"
  ON public.quest_chain_steps FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quest_chains qc
    WHERE qc.id = chain_id AND qc.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own quest chain steps"
  ON public.quest_chain_steps FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quest_chains qc
    WHERE qc.id = chain_id AND qc.user_id = auth.uid()
  ));

-- Automatic updated_at triggers
DROP TRIGGER IF EXISTS tr_streaks_updated_at ON public.streaks;
CREATE TRIGGER tr_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_quest_chains_updated_at ON public.quest_chains;
CREATE TRIGGER tr_quest_chains_updated_at
  BEFORE UPDATE ON public.quest_chains
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_quest_chain_steps_updated_at ON public.quest_chain_steps;
CREATE TRIGGER tr_quest_chain_steps_updated_at
  BEFORE UPDATE ON public.quest_chain_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Stored Procedure: recover_streak()
CREATE OR REPLACE FUNCTION public.recover_streak()
RETURNS JSONB AS $$
DECLARE
  v_streak RECORD;
  v_yesterday DATE;
  v_day_before DATE;
  v_recovered_streak INTEGER;
BEGIN
  v_yesterday := (timezone('utc'::text, now()) - INTERVAL '1 day')::date;
  v_day_before := (timezone('utc'::text, now()) - INTERVAL '2 days')::date;

  -- 1. Fetch user streak
  SELECT * INTO v_streak
  FROM public.streaks
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Streak profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Verify recovery available
  IF NOT v_streak.recovery_available THEN
    RAISE EXCEPTION 'Streak recovery shield has already been used' USING ERRCODE = 'P0004';
  END IF;

  -- 3. Verify user missed exactly yesterday (i.e. last activity was day before yesterday)
  IF v_streak.last_activity_date IS NULL OR v_streak.last_activity_date != v_day_before THEN
    RAISE EXCEPTION 'Not eligible for streak recovery: exactly one day must be missed' USING ERRCODE = 'P0005';
  END IF;

  -- 4. Record recovery activity for yesterday
  INSERT INTO public.streak_activities (user_id, activity_date, quests_completed, is_recovery)
  VALUES (auth.uid(), v_yesterday, 1, true)
  ON CONFLICT (user_id, activity_date) DO NOTHING;

  -- 5. Restore streak
  v_recovered_streak := v_streak.current_streak + 1;

  UPDATE public.streaks
  SET current_streak = v_recovered_streak,
      longest_streak = GREATEST(v_streak.longest_streak, v_recovered_streak),
      last_activity_date = v_yesterday,
      recovery_available = false,
      updated_at = timezone('utc'::text, now())
  WHERE user_id = auth.uid();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Streak successfully recovered!',
    'recovered_date', v_yesterday,
    'new_streak', v_recovered_streak,
    'recovery_available', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated Atomic Stored Procedure: complete_quest() integrating Streaks and Quest Chains
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_quest RECORD;
  v_character RECORD;
  v_streak RECORD;
  v_chain_step RECORD;
  v_next_step RECORD;
  v_today DATE;
  v_yesterday DATE;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_leveled_up BOOLEAN;
  v_first_today BOOLEAN := false;
  v_new_streak INTEGER;
  v_longest_streak INTEGER;
  v_streak_extended BOOLEAN := false;
  v_is_new_record BOOLEAN := false;
  v_chain_progress JSONB := NULL;
  v_is_chain_completed BOOLEAN := false;
  v_total_chain_steps INTEGER := 0;
  v_completed_chain_steps INTEGER := 0;
BEGIN
  v_today := timezone('utc'::text, now())::date;
  v_yesterday := (timezone('utc'::text, now()) - INTERVAL '1 day')::date;

  -- 1. Fetch active quest belonging to current authenticated user
  SELECT * INTO v_quest
  FROM public.quests
  WHERE id = p_quest_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found or unauthorized' USING ERRCODE = 'P0002';
  END IF;

  IF v_quest.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Quest already completed' USING ERRCODE = 'P0003';
  END IF;

  -- 2. Quest Chain check: if attached to a chain, assert status is AVAILABLE (cannot complete LOCKED step)
  SELECT * INTO v_chain_step
  FROM public.quest_chain_steps
  WHERE quest_id = p_quest_id
  FOR UPDATE;

  IF FOUND THEN
    IF v_chain_step.status = 'LOCKED' THEN
      RAISE EXCEPTION 'Cannot complete locked quest chain step. Complete preceding steps first.' USING ERRCODE = 'P0006';
    END IF;
  END IF;

  -- 3. Mark quest completed atomically
  UPDATE public.quests
  SET status = 'COMPLETED',
      completed_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_quest_id;

  -- 4. Update character XP & Level
  SELECT * INTO v_character
  FROM public.characters
  WHERE id = v_quest.character_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character profile not found' USING ERRCODE = 'P0002';
  END IF;

  v_old_level := v_character.level;
  v_new_xp := v_character.xp + v_quest.xp_reward;
  v_new_level := public.calculate_character_level(v_new_xp);
  v_leveled_up := v_new_level > v_old_level;

  UPDATE public.characters
  SET xp = v_new_xp,
      level = v_new_level,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- 5. Streak & Daily Activity Processing
  -- Upsert daily activity
  INSERT INTO public.streak_activities (user_id, activity_date, quests_completed)
  VALUES (auth.uid(), v_today, 1)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET quests_completed = public.streak_activities.quests_completed + 1
  RETURNING (xmax = 0) INTO v_first_today; -- true if inserted (first today), false if updated

  -- Fetch or initialize user streak
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (auth.uid(), 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_streak
  FROM public.streaks
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF v_first_today THEN
    -- If yesterday was active, streak increments
    IF v_streak.last_activity_date = v_yesterday THEN
      v_new_streak := v_streak.current_streak + 1;
      v_streak_extended := true;
    ELSE
      -- Starting or resetting streak
      v_new_streak := 1;
      v_streak_extended := false;
    END IF;

    v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
    v_is_new_record := v_new_streak > v_streak.longest_streak;

    UPDATE public.streaks
    SET current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = auth.uid();
  ELSE
    v_new_streak := v_streak.current_streak;
    v_longest_streak := v_streak.longest_streak;
  END IF;

  -- 6. Quest Chain Advancement
  IF v_chain_step.id IS NOT NULL THEN
    -- Mark this step completed
    UPDATE public.quest_chain_steps
    SET status = 'COMPLETED',
        updated_at = timezone('utc'::text, now())
    WHERE id = v_chain_step.id;

    -- Look for the next step (step_order + 1)
    SELECT * INTO v_next_step
    FROM public.quest_chain_steps
    WHERE chain_id = v_chain_step.chain_id AND step_order = v_chain_step.step_order + 1
    FOR UPDATE;

    IF FOUND THEN
      -- Unlock next step
      UPDATE public.quest_chain_steps
      SET status = 'AVAILABLE',
          updated_at = timezone('utc'::text, now())
      WHERE id = v_next_step.id;
    ELSE
      -- All steps completed! Mark chain completed
      v_is_chain_completed := true;
      UPDATE public.quest_chains
      SET status = 'COMPLETED',
          updated_at = timezone('utc'::text, now())
      WHERE id = v_chain_step.chain_id;
    END IF;

    -- Count total and completed steps
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'COMPLETED')
    INTO v_total_chain_steps, v_completed_chain_steps
    FROM public.quest_chain_steps
    WHERE chain_id = v_chain_step.chain_id;

    v_chain_progress := jsonb_build_object(
      'chain_id', v_chain_step.chain_id,
      'completed_step_order', v_chain_step.step_order,
      'total_steps', v_total_chain_steps,
      'completed_steps', v_completed_chain_steps,
      'is_chain_completed', v_is_chain_completed,
      'next_step_order', CASE WHEN v_next_step.id IS NOT NULL THEN v_next_step.step_order ELSE NULL END
    );
  END IF;

  RETURN jsonb_build_object(
    'quest', jsonb_build_object(
      'id', v_quest.id,
      'title', v_quest.title,
      'category', v_quest.category,
      'difficulty', v_quest.difficulty,
      'xp_reward', v_quest.xp_reward,
      'status', 'COMPLETED'
    ),
    'xp_awarded', v_quest.xp_reward,
    'character', jsonb_build_object(
      'id', v_character.id,
      'xp', v_new_xp,
      'level', v_new_level
    ),
    'previous_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up,
    'streak', jsonb_build_object(
      'current_streak', v_new_streak,
      'longest_streak', v_longest_streak,
      'first_today', v_first_today,
      'streak_extended', v_streak_extended,
      'is_new_record', v_is_new_record
    ),
    'chain_progress', v_chain_progress
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
