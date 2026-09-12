-- ================================================================
-- Migration 005: Create Boss Quests System and integrate with Quest Completion
-- ================================================================

-- 1. Create boss_quests table
CREATE TABLE IF NOT EXISTS public.boss_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Rare', 'Epic', 'Legendary')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')),
    deadline DATE,
    reward_xp INT NOT NULL CHECK (reward_xp > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- 2. Create boss_objectives table
CREATE TABLE IF NOT EXISTS public.boss_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boss_id UUID NOT NULL REFERENCES public.boss_quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 1,
    required_progress INT NOT NULL DEFAULT 1 CHECK (required_progress > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create boss_objective_quests join table
CREATE TABLE IF NOT EXISTS public.boss_objective_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID NOT NULL REFERENCES public.boss_objectives(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_boss_objective_quest UNIQUE (objective_id, quest_id)
);

-- 4. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_boss_quests_user_status ON public.boss_quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_boss_quests_char ON public.boss_quests(character_id);
CREATE INDEX IF NOT EXISTS idx_boss_objectives_boss ON public.boss_objectives(boss_id, display_order);
CREATE INDEX IF NOT EXISTS idx_boss_objective_quests_obj ON public.boss_objective_quests(objective_id);
CREATE INDEX IF NOT EXISTS idx_boss_objective_quests_quest ON public.boss_objective_quests(quest_id);

-- 5. Row Level Security Policies
ALTER TABLE public.boss_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_objective_quests ENABLE ROW LEVEL SECURITY;

-- boss_quests policies
DROP POLICY IF EXISTS Users can view own boss quests ON public.boss_quests;
CREATE POLICY Users can view own boss quests ON public.boss_quests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can insert own boss quests ON public.boss_quests;
CREATE POLICY Users can insert own boss quests ON public.boss_quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can update own boss quests ON public.boss_quests;
CREATE POLICY Users can update own boss quests ON public.boss_quests
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can delete own boss quests ON public.boss_quests;
CREATE POLICY Users can delete own boss quests ON public.boss_quests
    FOR DELETE USING (auth.uid() = user_id);

-- boss_objectives policies
DROP POLICY IF EXISTS Users can view own boss objectives ON public.boss_objectives;
CREATE POLICY Users can view own boss objectives ON public.boss_objectives
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can insert own boss objectives ON public.boss_objectives;
CREATE POLICY Users can insert own boss objectives ON public.boss_objectives
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can update own boss objectives ON public.boss_objectives;
CREATE POLICY Users can update own boss objectives ON public.boss_objectives
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can delete own boss objectives ON public.boss_objectives;
CREATE POLICY Users can delete own boss objectives ON public.boss_objectives
    FOR DELETE USING (auth.uid() = user_id);

-- boss_objective_quests policies
DROP POLICY IF EXISTS Users can view own boss objective quests ON public.boss_objective_quests;
CREATE POLICY Users can view own boss objective quests ON public.boss_objective_quests
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can insert own boss objective quests ON public.boss_objective_quests;
CREATE POLICY Users can insert own boss objective quests ON public.boss_objective_quests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS Users can delete own boss objective quests ON public.boss_objective_quests;
CREATE POLICY Users can delete own boss objective quests ON public.boss_objective_quests
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Updated Stored Procedure: complete_quest() integrating Streaks, Chains, Attributes, SP, Evolution, and Boss Quests
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB AS 
DECLARE
  v_quest RECORD;
  v_character RECORD;
  v_streak RECORD;
  v_chain_step RECORD;
  v_next_step RECORD;
  v_attr RECORD;
  v_attr_key VARCHAR;
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
  v_old_attr_level INTEGER := 1;
  v_new_attr_xp INTEGER := 0;
  v_new_attr_level INTEGER := 1;
  v_attr_leveled_up BOOLEAN := false;
  v_sp_earned INTEGER := 0;
  v_total_sp INTEGER := 0;
  v_skills_count INTEGER := 0;
  v_max_attr_level INTEGER := 1;
  v_new_evolution_tier INTEGER := 1;
  v_new_evolution_title VARCHAR;
  v_evolution_changed BOOLEAN := false;

  -- Boss Quest variables
  v_boss_obj_quest RECORD;
  v_boss_obj RECORD;
  v_boss RECORD;
  v_boss_completed_obj_count INTEGER := 0;
  v_boss_total_obj_count INTEGER := 0;
  v_boss_defeated BOOLEAN := false;
  v_boss_defeat_result JSONB := NULL;
  v_boss_reward_xp INTEGER := 0;
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

  -- 2. Quest Chain check: if attached to a chain, assert status is AVAILABLE
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

  -- 4. Update character overall XP & Level
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

  IF v_leveled_up THEN
    v_sp_earned := v_sp_earned + (v_new_level - v_old_level);
  END IF;

  -- 5. Attribute XP & Level processing
  CASE v_quest.category
    WHEN 'Health' THEN v_attr_key := 'STRENGTH';
    WHEN 'Learning' THEN v_attr_key := 'INTELLIGENCE';
    WHEN 'Career' THEN v_attr_key := 'DISCIPLINE';
    WHEN 'Finance' THEN v_attr_key := 'WISDOM';
    WHEN 'Creativity' THEN v_attr_key := 'CREATIVITY';
    WHEN 'Personal' THEN v_attr_key := 'RESILIENCE';
    ELSE v_attr_key := 'STRENGTH';
  END CASE;

  INSERT INTO public.character_attributes (character_id, user_id, attribute_key, xp, level)
  VALUES (v_character.id, auth.uid(), v_attr_key, 0, 1)
  ON CONFLICT (character_id, attribute_key) DO NOTHING;

  SELECT * INTO v_attr
  FROM public.character_attributes
  WHERE character_id = v_character.id AND attribute_key = v_attr_key
  FOR UPDATE;

  v_old_attr_level := v_attr.level;
  v_new_attr_xp := v_attr.xp + v_quest.xp_reward;
  v_new_attr_level := public.calculate_attribute_level(v_new_attr_xp);
  v_attr_leveled_up := v_new_attr_level > v_old_attr_level;

  IF v_attr_leveled_up THEN
    v_sp_earned := v_sp_earned + (v_new_attr_level - v_old_attr_level);
  END IF;

  UPDATE public.character_attributes
  SET xp = v_new_attr_xp,
      level = v_new_attr_level,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_attr.id;

  -- 6. Streak & Daily Activity Processing
  INSERT INTO public.streak_activities (user_id, activity_date, quests_completed)
  VALUES (auth.uid(), v_today, 1)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET quests_completed = public.streak_activities.quests_completed + 1
  RETURNING (xmax = 0) INTO v_first_today;

  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (auth.uid(), 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_streak
  FROM public.streaks
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF v_first_today THEN
    IF v_streak.last_activity_date = v_yesterday THEN
      v_new_streak := v_streak.current_streak + 1;
      v_streak_extended := true;
    ELSE
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

  -- 7. Quest Chain Advancement
  IF v_chain_step.id IS NOT NULL THEN
    UPDATE public.quest_chain_steps
    SET status = 'COMPLETED',
        updated_at = timezone('utc'::text, now())
    WHERE id = v_chain_step.id;

    SELECT * INTO v_next_step
    FROM public.quest_chain_steps
    WHERE chain_id = v_chain_step.chain_id AND step_order = v_chain_step.step_order + 1
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.quest_chain_steps
      SET status = 'AVAILABLE',
          updated_at = timezone('utc'::text, now())
      WHERE id = v_next_step.id;
    ELSE
      v_is_chain_completed := true;
      UPDATE public.quest_chains
      SET status = 'COMPLETED',
          updated_at = timezone('utc'::text, now())
      WHERE id = v_chain_step.chain_id;
    END IF;

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

  -- 8. Boss Objective & Boss Defeat Processing
  FOR v_boss_obj_quest IN
    SELECT boq.objective_id, bo.boss_id
    FROM public.boss_objective_quests boq
    JOIN public.boss_objectives bo ON bo.id = boq.objective_id
    WHERE boq.quest_id = p_quest_id AND boq.user_id = auth.uid()
  LOOP
    SELECT * INTO v_boss
    FROM public.boss_quests
    WHERE id = v_boss_obj_quest.boss_id AND user_id = auth.uid()
    FOR UPDATE;

    IF FOUND AND v_boss.status = 'ACTIVE' THEN
      -- Count total and completed objectives for this boss
      -- An objective is completed if count of completed linked quests >= required_progress
      SELECT
        COUNT(bo.id),
        COUNT(bo.id) FILTER (
          WHERE (
            SELECT COUNT(*)
            FROM public.boss_objective_quests boq2
            JOIN public.quests q2 ON q2.id = boq2.quest_id
            WHERE boq2.objective_id = bo.id AND q2.status = 'COMPLETED'
          ) >= bo.required_progress
        )
      INTO v_boss_total_obj_count, v_boss_completed_obj_count
      FROM public.boss_objectives bo
      WHERE bo.boss_id = v_boss.id;

      -- If all objectives are completed, defeat the boss!
      IF v_boss_total_obj_count > 0 AND v_boss_completed_obj_count >= v_boss_total_obj_count THEN
        v_boss_defeated := true;
        v_boss_reward_xp := v_boss.reward_xp;

        UPDATE public.boss_quests
        SET status = 'COMPLETED',
            completed_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_boss.id;

        -- Award boss reward XP to character
        v_new_xp := v_new_xp + v_boss_reward_xp;
        
        -- Recalculate character level with the added boss XP
        DECLARE
          v_level_after_boss INTEGER;
        BEGIN
          v_level_after_boss := public.calculate_character_level(v_new_xp);
          IF v_level_after_boss > v_new_level THEN
            v_sp_earned := v_sp_earned + (v_level_after_boss - v_new_level);
            v_new_level := v_level_after_boss;
            v_leveled_up := true;
          END IF;
        END;

        v_boss_defeat_result := jsonb_build_object(
          'boss_id', v_boss.id,
          'boss_title', v_boss.title,
          'difficulty', v_boss.difficulty,
          'reward_xp', v_boss.reward_xp,
          'completed_at', timezone('utc'::text, now()),
          'defeated', true
        );
      END IF;
    END IF;
  END LOOP;

  -- 9. Character Skill Points and Evolution Update
  v_total_sp := v_character.skill_points + v_sp_earned;

  SELECT COUNT(*) INTO v_skills_count
  FROM public.character_skills
  WHERE character_id = v_character.id;

  SELECT COALESCE(MAX(level), 1) INTO v_max_attr_level
  FROM public.character_attributes
  WHERE character_id = v_character.id;

  v_new_evolution_tier := public.calculate_evolution_tier(
    v_new_level,
    v_skills_count,
    v_max_attr_level
  );
  v_new_evolution_title := public.get_evolution_title(v_character.avatar, v_new_evolution_tier);
  v_evolution_changed := v_new_evolution_tier > v_character.evolution_tier;

  UPDATE public.characters
  SET xp = v_new_xp,
      level = v_new_level,
      skill_points = v_total_sp,
      evolution_tier = v_new_evolution_tier,
      evolution_title = v_new_evolution_title,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- 10. Return unified result
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
      'level', v_new_level,
      'skill_points', v_total_sp,
      'evolution_tier', v_new_evolution_tier,
      'evolution_title', v_new_evolution_title
    ),
    'previous_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up,
    'attribute_gain', jsonb_build_object(
      'attribute_key', v_attr_key,
      'xp_gained', v_quest.xp_reward,
      'previous_level', v_old_attr_level,
      'new_level', v_new_attr_level,
      'leveled_up', v_attr_leveled_up,
      'skill_points_earned', CASE WHEN v_attr_leveled_up THEN (v_new_attr_level - v_old_attr_level) ELSE 0 END
    ),
    'skill_points_earned', v_sp_earned,
    'unspent_skill_points', v_total_sp,
    'evolution', jsonb_build_object(
      'tier', v_new_evolution_tier,
      'title', v_new_evolution_title,
      'tier_name', CASE v_new_evolution_tier WHEN 4 THEN 'Paragon' WHEN 3 THEN 'Master' WHEN 2 THEN 'Adept' ELSE 'Initiate' END,
      'evolved', v_evolution_changed,
      'previous_tier', v_character.evolution_tier
    ),
    'streak', jsonb_build_object(
      'current_streak', v_new_streak,
      'longest_streak', v_longest_streak,
      'first_today', v_first_today,
      'streak_extended', v_streak_extended,
      'is_new_record', v_is_new_record
    ),
    'chain_progress', v_chain_progress,
    'boss_defeat', v_boss_defeat_result
  );
END;
 LANGUAGE plpgsql SECURITY DEFINER;
