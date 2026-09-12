-- ================================================================
-- Migration 008: Create Achievements and User Achievement Progress
-- ================================================================

-- 1. Create public.achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'QUESTS', 'STREAKS', 'QUEST_CHAINS', 'BOSS_QUESTS',
        'PROGRESSION', 'SKILLS', 'ECONOMY', 'INVENTORY'
    )),
    icon VARCHAR(50) NOT NULL,
    requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN (
        'QUEST_COUNT', 'STREAK_DAYS', 'QUEST_CHAIN_COUNT', 'BOSS_COMPLETION_COUNT',
        'PLAYER_LEVEL', 'SKILL_COUNT', 'GOLD_EARNED', 'ITEM_COUNT', 'EQUIPPED_ITEM_COUNT'
    )),
    target INTEGER NOT NULL CHECK (target > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create public.user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_character_achievement UNIQUE (character_id, achievement_id)
);

-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_char ON public.user_achievements(character_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);

-- 4. Row Level Security Policies
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active achievements" ON public.achievements;
CREATE POLICY "Public can view active achievements" ON public.achievements
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own achievements" ON public.user_achievements;
CREATE POLICY "Users can update own achievements" ON public.user_achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Seed Catalog Achievements
INSERT INTO public.achievements (id, key, name, description, category, icon, requirement_type, target, is_active)
VALUES
    ('90000000-0000-4000-8000-000000000001', 'FIRST_QUEST', 'First Step Forward', 'Complete your first real-life quest.', 'QUESTS', 'CheckCircle2', 'QUEST_COUNT', 1, true),
    ('90000000-0000-4000-8000-000000000002', 'QUEST_APPRENTICE_10', 'Consistent Crusader', 'Conquer 10 real-life quests.', 'QUESTS', 'Swords', 'QUEST_COUNT', 10, true),
    ('90000000-0000-4000-8000-000000000003', 'QUEST_MASTER_50', 'Legend of Deeds', 'Conquer 50 real-life quests across your life journey.', 'QUESTS', 'Award', 'QUEST_COUNT', 50, true),
    ('90000000-0000-4000-8000-000000000004', 'STREAK_3_DAYS', 'Momentum Spark', 'Maintain daily productivity for 3 consecutive days.', 'STREAKS', 'Flame', 'STREAK_DAYS', 3, true),
    ('90000000-0000-4000-8000-000000000005', 'STREAK_7_DAYS', 'Iron Discipline', 'Maintain a full week (7 days) of unbroken streak momentum.', 'STREAKS', 'Zap', 'STREAK_DAYS', 7, true),
    ('90000000-0000-4000-8000-000000000006', 'STREAK_30_DAYS', 'Unstoppable Will', 'Maintain a monumental 30-day streak of daily consistency.', 'STREAKS', 'Crown', 'STREAK_DAYS', 30, true),
    ('90000000-0000-4000-8000-000000000007', 'FIRST_CHAIN_COMPLETED', 'Pathfinder', 'Complete your first multi-step Quest Chain roadmap.', 'QUEST_CHAINS', 'Link', 'QUEST_CHAIN_COUNT', 1, true),
    ('90000000-0000-4000-8000-000000000008', 'FIRST_BOSS_DEFEATED', 'Titan Vanquisher', 'Defeat your first monumental Boss Quest encounter.', 'BOSS_QUESTS', 'Trophy', 'BOSS_COMPLETION_COUNT', 1, true),
    ('90000000-0000-4000-8000-000000000009', 'LEVEL_5_REACHED', 'Rising Adventurer', 'Reach Character Level 5 through dedicated action.', 'PROGRESSION', 'Shield', 'PLAYER_LEVEL', 5, true),
    ('90000000-0000-4000-8000-000000000010', 'LEVEL_10_REACHED', 'Paragon of Will', 'Ascend to Character Level 10.', 'PROGRESSION', 'Sparkles', 'PLAYER_LEVEL', 10, true),
    ('90000000-0000-4000-8000-000000000011', 'FIRST_SKILL_UNLOCKED', 'Awakened Mind', 'Attune your first passive perk in the Skill Tree.', 'SKILLS', 'GitFork', 'SKILL_COUNT', 1, true),
    ('90000000-0000-4000-8000-000000000012', 'SKILL_ADEPT_5', 'Polymath Specialization', 'Attune 5 capability perks across your lifestyle branches.', 'SKILLS', 'BookOpen', 'SKILL_COUNT', 5, true),
    ('90000000-0000-4000-8000-000000000013', 'FIRST_PURCHASE', 'Patron of Prosperity', 'Purchase your first reward item in the Shop.', 'ECONOMY', 'Store', 'ITEM_COUNT', 1, true),
    ('90000000-0000-4000-8000-000000000014', 'FIRST_ITEM_EQUIPPED', 'Suit Up', 'Equip an acquired avatar, theme, badge, or cosmetic aura.', 'INVENTORY', 'Backpack', 'EQUIPPED_ITEM_COUNT', 1, true)
ON CONFLICT (key) DO NOTHING;

-- 6. Stored Procedure: evaluate_user_achievements(p_character_id UUID)
CREATE OR REPLACE FUNCTION public.evaluate_user_achievements(p_character_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_character RECORD;
  v_quest_count INTEGER := 0;
  v_streak_days INTEGER := 0;
  v_chain_count INTEGER := 0;
  v_boss_count INTEGER := 0;
  v_player_level INTEGER := 1;
  v_skill_count INTEGER := 0;
  v_gold_earned INTEGER := 0;
  v_item_count INTEGER := 0;
  v_equipped_count INTEGER := 0;
  v_ach RECORD;
  v_current_progress INTEGER;
  v_unlocked_records JSONB := '[]'::jsonb;
  v_existing RECORD;
BEGIN
  -- Authenticate caller
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify character ownership
  SELECT * INTO v_character
  FROM public.characters
  WHERE id = p_character_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found';
  END IF;

  -- 1. Derive metrics deterministically
  SELECT count(*) INTO v_quest_count FROM public.quests WHERE character_id = p_character_id AND status = 'COMPLETED';
  SELECT COALESCE(longest_streak, 0) INTO v_streak_days FROM public.streaks WHERE user_id = v_user_id;
  SELECT count(*) INTO v_chain_count FROM public.quest_chains WHERE user_id = v_user_id AND status = 'COMPLETED';
  SELECT count(*) INTO v_boss_count FROM public.boss_quests WHERE user_id = v_user_id AND status = 'COMPLETED';
  v_player_level := COALESCE(v_character.level, 1);
  SELECT count(*) INTO v_skill_count FROM public.user_skills WHERE user_id = v_user_id AND is_unlocked = true;
  SELECT COALESCE(sum(amount), 0) INTO v_gold_earned FROM public.economy_transactions WHERE user_id = v_user_id AND type = 'EARN';
  SELECT count(*) INTO v_item_count FROM public.purchases WHERE character_id = p_character_id;
  SELECT count(*) INTO v_equipped_count FROM public.character_equipment WHERE character_id = p_character_id;

  -- 2. Evaluate all active achievements
  FOR v_ach IN SELECT * FROM public.achievements WHERE is_active = true LOOP
    -- Determine progress based on requirement type
    CASE v_ach.requirement_type
      WHEN 'QUEST_COUNT' THEN v_current_progress := v_quest_count;
      WHEN 'STREAK_DAYS' THEN v_current_progress := v_streak_days;
      WHEN 'QUEST_CHAIN_COUNT' THEN v_current_progress := v_chain_count;
      WHEN 'BOSS_COMPLETION_COUNT' THEN v_current_progress := v_boss_count;
      WHEN 'PLAYER_LEVEL' THEN v_current_progress := v_player_level;
      WHEN 'SKILL_COUNT' THEN v_current_progress := v_skill_count;
      WHEN 'GOLD_EARNED' THEN v_current_progress := v_gold_earned;
      WHEN 'ITEM_COUNT' THEN v_current_progress := v_item_count;
      WHEN 'EQUIPPED_ITEM_COUNT' THEN v_current_progress := v_equipped_count;
      ELSE v_current_progress := 0;
    END CASE;

    -- Clamp progress to target
    IF v_current_progress > v_ach.target THEN
      v_current_progress := v_ach.target;
    END IF;

    -- Check existing record
    SELECT * INTO v_existing FROM public.user_achievements
    WHERE character_id = p_character_id AND achievement_id = v_ach.id;

    IF NOT FOUND THEN
      -- First time recording
      INSERT INTO public.user_achievements (
        character_id, user_id, achievement_id, progress, is_unlocked, unlocked_at
      ) VALUES (
        p_character_id, v_user_id, v_ach.id, v_current_progress,
        v_current_progress >= v_ach.target,
        CASE WHEN v_current_progress >= v_ach.target THEN timezone('utc'::text, now()) ELSE NULL END
      );

      IF v_current_progress >= v_ach.target THEN
        v_unlocked_records := v_unlocked_records || jsonb_build_object('id', v_ach.id, 'key', v_ach.key, 'name', v_ach.name);
      END IF;
    ELSE
      -- Record exists; if not already unlocked and now reaching target -> unlock!
      IF NOT v_existing.is_unlocked AND v_current_progress >= v_ach.target THEN
        UPDATE public.user_achievements
        SET progress = v_current_progress,
            is_unlocked = true,
            unlocked_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_existing.id;

        v_unlocked_records := v_unlocked_records || jsonb_build_object('id', v_ach.id, 'key', v_ach.key, 'name', v_ach.name);
      ELSIF NOT v_existing.is_unlocked AND v_current_progress > v_existing.progress THEN
        UPDATE public.user_achievements
        SET progress = v_current_progress,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_existing.id;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'newlyUnlocked', v_unlocked_records
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
