-- Migration: 20260912000004_create_attributes_skills_evolution.sql
-- Description: Phase 5 - Character Attributes, Skill Tree, and Character Evolution

-- 1. Extend characters table with skill points and evolution metadata
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS skill_points INTEGER NOT NULL DEFAULT 0 CHECK (skill_points >= 0),
  ADD COLUMN IF NOT EXISTS evolution_tier INTEGER NOT NULL DEFAULT 1 CHECK (evolution_tier BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS evolution_title VARCHAR(80) NOT NULL DEFAULT 'Initiate';

-- 2. Create character_attributes table
CREATE TABLE IF NOT EXISTS public.character_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.characters(user_id) ON DELETE CASCADE,
  attribute_key VARCHAR(30) NOT NULL CHECK (
    attribute_key IN ('STRENGTH', 'INTELLIGENCE', 'DISCIPLINE', 'WISDOM', 'CREATIVITY', 'RESILIENCE')
  ),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_character_attribute UNIQUE(character_id, attribute_key)
);

-- 3. Create character_skills table
CREATE TABLE IF NOT EXISTS public.character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.characters(user_id) ON DELETE CASCADE,
  skill_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_character_skill UNIQUE(character_id, skill_id)
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_character_attributes_user_id ON public.character_attributes(user_id);
CREATE INDEX IF NOT EXISTS idx_character_attributes_character_id ON public.character_attributes(character_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_user_id ON public.character_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_character_id ON public.character_skills(character_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.character_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_skills ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DROP POLICY IF EXISTS "Users can view own attributes" ON public.character_attributes;
CREATE POLICY "Users can view own attributes"
  ON public.character_attributes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attributes" ON public.character_attributes;
CREATE POLICY "Users can insert own attributes"
  ON public.character_attributes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own attributes" ON public.character_attributes;
CREATE POLICY "Users can update own attributes"
  ON public.character_attributes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own skills" ON public.character_skills;
CREATE POLICY "Users can view own skills"
  ON public.character_skills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own skills" ON public.character_skills;
CREATE POLICY "Users can insert own skills"
  ON public.character_skills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. Triggers for updated_at
DROP TRIGGER IF EXISTS tr_character_attributes_updated_at ON public.character_attributes;
CREATE TRIGGER tr_character_attributes_updated_at
  BEFORE UPDATE ON public.character_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Mathematical function: calculate_attribute_level()
CREATE OR REPLACE FUNCTION public.calculate_attribute_level(p_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF p_xp < 50 THEN
    RETURN 1;
  ELSIF p_xp < 150 THEN
    RETURN 2;
  ELSIF p_xp < 300 THEN
    RETURN 3;
  ELSIF p_xp < 500 THEN
    RETURN 4;
  ELSIF p_xp < 750 THEN
    RETURN 5;
  ELSE
    RETURN 6 + FLOOR((p_xp - 750)::FLOAT / 250)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9. Evolution tier calculator: calculate_evolution_tier()
CREATE OR REPLACE FUNCTION public.calculate_evolution_tier(
  p_level INTEGER,
  p_skills_count INTEGER,
  p_max_attr_level INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  IF p_level >= 20 AND p_skills_count >= 10 AND p_max_attr_level >= 7 THEN
    RETURN 4;
  ELSIF p_level >= 10 AND p_skills_count >= 6 AND p_max_attr_level >= 5 THEN
    RETURN 3;
  ELSIF p_level >= 5 AND p_skills_count >= 3 AND p_max_attr_level >= 3 THEN
    RETURN 2;
  ELSE
    RETURN 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. Archetype evolution title resolver
CREATE OR REPLACE FUNCTION public.get_evolution_title(
  p_avatar VARCHAR,
  p_tier INTEGER
)
RETURNS VARCHAR AS $$
BEGIN
  IF LOWER(p_avatar) = 'scholar' THEN
    IF p_tier = 4 THEN RETURN 'Omniscient Luminary';
    ELSIF p_tier = 3 THEN RETURN 'High Arcanist';
    ELSIF p_tier = 2 THEN RETURN 'Arcane Scholar';
    ELSE RETURN 'Arcanist Apprentice';
    END IF;
  ELSIF LOWER(p_avatar) = 'scout' THEN
    IF p_tier = 4 THEN RETURN 'Apex Horizon';
    ELSIF p_tier = 3 THEN RETURN 'Phantom Warden';
    ELSIF p_tier = 2 THEN RETURN 'Shadow Ranger';
    ELSE RETURN 'Pathfinder Scout';
    END IF;
  ELSIF LOWER(p_avatar) = 'builder' THEN
    IF p_tier = 4 THEN RETURN 'Cosmic Worldsmith';
    ELSIF p_tier = 3 THEN RETURN 'Architect of Titans';
    ELSIF p_tier = 2 THEN RETURN 'Master Artificer';
    ELSE RETURN 'Novice Artificer';
    END IF;
  ELSIF LOWER(p_avatar) = 'alchemist' THEN
    IF p_tier = 4 THEN RETURN 'Transmuted Sovereign';
    ELSIF p_tier = 3 THEN RETURN 'Philosopher Sage';
    ELSIF p_tier = 2 THEN RETURN 'Grand Alchemist';
    ELSE RETURN 'Initiate Chemist';
    END IF;
  ELSIF LOWER(p_avatar) = 'sentinel' THEN
    IF p_tier = 4 THEN RETURN 'Eternal Aegis';
    ELSIF p_tier = 3 THEN RETURN 'Aegis Commander';
    ELSIF p_tier = 2 THEN RETURN 'Bastion Guardian';
    ELSE RETURN 'Acolyte Guardian';
    END IF;
  ELSE -- warrior / default
    IF p_tier = 4 THEN RETURN 'Immortal Sovereign';
    ELSIF p_tier = 3 THEN RETURN 'Warlord Champion';
    ELSIF p_tier = 2 THEN RETURN 'Blade Vanguard';
    ELSE RETURN 'Vanguard Recruit';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 11. Stored Procedure: unlock_skill()
CREATE OR REPLACE FUNCTION public.unlock_skill(
  p_skill_id VARCHAR,
  p_sp_cost INTEGER,
  p_required_attr_level INTEGER,
  p_attr_key VARCHAR
)
RETURNS JSONB AS $$
DECLARE
  v_character RECORD;
  v_attr RECORD;
  v_already_unlocked BOOLEAN;
  v_skills_count INTEGER;
  v_max_attr_level INTEGER := 1;
  v_new_evolution_tier INTEGER;
  v_new_title VARCHAR;
BEGIN
  -- 1. Fetch character
  SELECT * INTO v_character
  FROM public.characters
  WHERE user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character profile not found' USING ERRCODE = 'P0002';
  END IF;

  -- 2. Check skill not already unlocked
  SELECT EXISTS (
    SELECT 1 FROM public.character_skills
    WHERE character_id = v_character.id AND skill_id = p_skill_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RAISE EXCEPTION 'Skill is already unlocked' USING ERRCODE = 'P0007';
  END IF;

  -- 3. Verify available skill points
  IF v_character.skill_points < p_sp_cost THEN
    RAISE EXCEPTION 'Insufficient skill points' USING ERRCODE = 'P0008';
  END IF;

  -- 4. Verify attribute level requirement
  SELECT * INTO v_attr
  FROM public.character_attributes
  WHERE character_id = v_character.id AND attribute_key = p_attr_key;

  IF NOT FOUND OR v_attr.level < p_required_attr_level THEN
    RAISE EXCEPTION 'Attribute level prerequisite not met' USING ERRCODE = 'P0009';
  END IF;

  -- 5. Insert unlocked skill
  INSERT INTO public.character_skills (character_id, user_id, skill_id)
  VALUES (v_character.id, auth.uid(), p_skill_id);

  -- 6. Deduct SP
  UPDATE public.characters
  SET skill_points = skill_points - p_sp_cost,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- 7. Count unlocked skills and max attribute level for evolution
  SELECT COUNT(*) INTO v_skills_count
  FROM public.character_skills
  WHERE character_id = v_character.id;

  SELECT COALESCE(MAX(level), 1) INTO v_max_attr_level
  FROM public.character_attributes
  WHERE character_id = v_character.id;

  v_new_evolution_tier := public.calculate_evolution_tier(
    v_character.level,
    v_skills_count,
    v_max_attr_level
  );
  v_new_title := public.get_evolution_title(v_character.avatar, v_new_evolution_tier);

  IF v_new_evolution_tier != v_character.evolution_tier THEN
    UPDATE public.characters
    SET evolution_tier = v_new_evolution_tier,
        evolution_title = v_new_title,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_character.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'skill_id', p_skill_id,
    'remaining_skill_points', v_character.skill_points - p_sp_cost,
    'skills_unlocked_count', v_skills_count,
    'evolution_tier', v_new_evolution_tier,
    'evolution_title', v_new_title,
    'new_evolution_unlocked', (v_new_evolution_tier > v_character.evolution_tier)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Updated Stored Procedure: complete_quest() integrating Streaks, Chains, Attributes, SP, and Evolution
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB AS $$
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
  -- Map quest category to attribute key
  CASE v_quest.category
    WHEN 'Health' THEN v_attr_key := 'STRENGTH';
    WHEN 'Learning' THEN v_attr_key := 'INTELLIGENCE';
    WHEN 'Career' THEN v_attr_key := 'DISCIPLINE';
    WHEN 'Finance' THEN v_attr_key := 'WISDOM';
    WHEN 'Creativity' THEN v_attr_key := 'CREATIVITY';
    WHEN 'Personal' THEN v_attr_key := 'RESILIENCE';
    ELSE v_attr_key := 'STRENGTH';
  END CASE;

  -- Upsert attribute row
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

  -- 6. Character Skill Points update
  v_total_sp := v_character.skill_points + v_sp_earned;

  -- 7. Evolution check
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

  -- 8. Streak & Daily Activity Processing
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

  -- 9. Quest Chain Advancement
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
    'chain_progress', v_chain_progress
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
