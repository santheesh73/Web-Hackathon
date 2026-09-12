-- ================================================================
-- Migration 006: Create Economy, Currency (Gold), Shop, Purchases, and Ledger
-- ================================================================

-- 1. Add gold column to public.characters if it does not already exist
ALTER TABLE public.characters 
  ADD COLUMN IF NOT EXISTS gold INTEGER NOT NULL DEFAULT 0 CHECK (gold >= 0);

-- 2. Create public.shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('AVATAR', 'THEME', 'BADGE', 'COSMETIC')),
    price INTEGER NOT NULL CHECK (price >= 0),
    icon VARCHAR(50),
    preview_color VARCHAR(20),
    rarity VARCHAR(20) NOT NULL DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create public.purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE RESTRICT,
    price_paid INTEGER NOT NULL CHECK (price_paid >= 0),
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_character_item_purchase UNIQUE (character_id, item_id)
);

-- 4. Create public.economy_transactions table (Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.economy_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('EARN', 'SPEND')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    source VARCHAR(30) NOT NULL CHECK (source IN ('QUEST_COMPLETION', 'CHAIN_COMPLETION', 'BOSS_COMPLETION', 'SHOP_PURCHASE', 'SYSTEM_GRANT', 'MILESTONE_BONUS')),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category, is_active);
CREATE INDEX IF NOT EXISTS idx_purchases_char ON public.purchases(character_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_char_date ON public.economy_transactions(character_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_economy_transactions_user ON public.economy_transactions(user_id);

-- 6. Row Level Security Policies
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_transactions ENABLE ROW LEVEL SECURITY;

-- shop_items is publicly readable
DROP POLICY IF EXISTS "Public can view active shop items" ON public.shop_items;
CREATE POLICY "Public can view active shop items" ON public.shop_items
    FOR SELECT USING (is_active = true);

-- purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchases;
CREATE POLICY "Users can insert own purchases" ON public.purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- economy_transactions policies
DROP POLICY IF EXISTS "Users can view own economy transactions" ON public.economy_transactions;
CREATE POLICY "Users can view own economy transactions" ON public.economy_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own economy transactions" ON public.economy_transactions;
CREATE POLICY "Users can insert own economy transactions" ON public.economy_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Seed Shop Catalog
INSERT INTO public.shop_items (id, key, name, description, category, price, icon, preview_color, rarity, is_active)
VALUES
  -- AVATARS
  ('11111111-1111-4111-8111-000000000001', 'avatar-cyber-samurai', 'Cyber Samurai', 'High-tech katana wielder dedicated to precision focus and disciplined execution.', 'AVATAR', 100, 'Sword', '#00F0FF', 'EPIC', true),
  ('11111111-1111-4111-8111-000000000002', 'avatar-mystic-scholar', 'Mystic Scholar', 'Keeper of ancient archives who converts deep study into raw intellectual power.', 'AVATAR', 75, 'BookOpen', '#A855F7', 'RARE', true),
  ('11111111-1111-4111-8111-000000000003', 'avatar-shadow-rogue', 'Shadow Rogue', 'Silent operative who navigates distractions and strikes down deadlines unobserved.', 'AVATAR', 120, 'EyeOff', '#64748B', 'EPIC', true),
  ('11111111-1111-4111-8111-000000000004', 'avatar-solar-paladin', 'Solar Paladin', 'Radiant champion armored in solar vigor, driving forward wellness and daily strength.', 'AVATAR', 150, 'Sun', '#FFD700', 'LEGENDARY', true),

  -- THEMES
  ('11111111-1111-4111-8111-000000000005', 'theme-obsidian-gold', 'Obsidian & Gold', 'Deep matte dark backdrop accented with opulent metallic gold highlights.', 'THEME', 80, 'Palette', '#D4AF37', 'EPIC', true),
  ('11111111-1111-4111-8111-000000000006', 'theme-neon-matrix', 'Neon Matrix', 'High-contrast cyberpunk emerald glow on midnight black terminal surfaces.', 'THEME', 60, 'Terminal', '#10B981', 'RARE', true),
  ('11111111-1111-4111-8111-000000000007', 'theme-cyber-dusk', 'Cyber Dusk', 'Synthwave gradient blending deep purple shadows into vibrant magenta radiance.', 'THEME', 90, 'Moon', '#EC4899', 'RARE', true),
  ('11111111-1111-4111-8111-000000000008', 'theme-aurora-borealis', 'Aurora Borealis', 'Mystical polar auroras dancing across glassmorphism surfaces.', 'THEME', 120, 'Sparkles', '#06B6D4', 'LEGENDARY', true),

  -- BADGES
  ('11111111-1111-4111-8111-000000000009', 'badge-early-adopter', 'Pioneer Sigil', 'Honors early system explorers who forged path through Phase 1 of LIFE RPG.', 'BADGE', 30, 'Compass', '#3B82F6', 'COMMON', true),
  ('11111111-1111-4111-8111-000000000010', 'badge-discipline-master', 'Iron Will Insignia', 'Awarded to masters of unwavering consistency and relentless task execution.', 'BADGE', 60, 'Shield', '#F59E0B', 'RARE', true),
  ('11111111-1111-4111-8111-000000000011', 'badge-boss-slayer', 'Titan Hunter Crest', 'Emblem of conquering gargantuan milestone challenges and project bosses.', 'BADGE', 100, 'Trophy', '#EF4444', 'EPIC', true),
  ('11111111-1111-4111-8111-000000000012', 'badge-zen-master', 'Zen Master Seal', 'Reflects perfect equilibrium across physical, mental, and creative realms.', 'BADGE', 150, 'Flame', '#8B5CF6', 'LEGENDARY', true),

  -- COSMETICS
  ('11111111-1111-4111-8111-000000000013', 'cosmetic-golden-aura', 'Golden Aura', 'Envelops your profile avatar in a gentle, pulsing golden particle shimmer.', 'COSMETIC', 80, 'SunDim', '#EAB308', 'RARE', true),
  ('11111111-1111-4111-8111-000000000014', 'cosmetic-arcane-trail', 'Arcane Cursor Trail', 'Leaves sparkling cyan and violet stardust particles in the wake of interaction.', 'COSMETIC', 95, 'MousePointer', '#38BDF8', 'RARE', true),
  ('11111111-1111-4111-8111-000000000015', 'cosmetic-void-crown', 'Void Particle Crown', 'Crown of dark celestial stars floating above your character portrait.', 'COSMETIC', 130, 'Crown', '#C084FC', 'EPIC', true),
  ('11111111-1111-4111-8111-000000000016', 'cosmetic-phoenix-banner', 'Phoenix Embers Banner', 'Animated background banner with embers rising endlessly from rebirth.', 'COSMETIC', 200, 'Sparkle', '#F97316', 'LEGENDARY', true)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  icon = EXCLUDED.icon,
  preview_color = EXCLUDED.preview_color,
  rarity = EXCLUDED.rarity,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

-- 8. Stored Procedure: purchase_shop_item(p_item_id UUID)
CREATE OR REPLACE FUNCTION public.purchase_shop_item(p_item_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_character RECORD;
  v_item RECORD;
  v_new_gold INTEGER;
  v_purchase_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Authenticate caller
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify active item exists
  SELECT * INTO v_item
  FROM public.shop_items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found or unavailable';
  END IF;

  -- Lock character record for update to prevent concurrent double-spends
  SELECT * INTO v_character
  FROM public.characters
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found';
  END IF;

  -- Check if already owned
  IF EXISTS (
    SELECT 1 FROM public.purchases
    WHERE character_id = v_character.id AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item already owned';
  END IF;

  -- Check sufficient funds
  IF v_character.gold < v_item.price THEN
    RAISE EXCEPTION 'Insufficient gold. Required: %, Available: %', v_item.price, v_character.gold;
  END IF;

  -- Deduct gold
  v_new_gold := v_character.gold - v_item.price;

  UPDATE public.characters
  SET gold = v_new_gold,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- Insert purchase record
  INSERT INTO public.purchases (
    character_id,
    user_id,
    item_id,
    price_paid,
    purchased_at
  ) VALUES (
    v_character.id,
    v_user_id,
    v_item.id,
    v_item.price,
    timezone('utc'::text, now())
  ) RETURNING id INTO v_purchase_id;

  -- Insert ledger entry into economy_transactions
  INSERT INTO public.economy_transactions (
    character_id,
    user_id,
    type,
    amount,
    balance_after,
    source,
    reference_id,
    description,
    created_at
  ) VALUES (
    v_character.id,
    v_user_id,
    'SPEND',
    v_item.price,
    v_new_gold,
    'SHOP_PURCHASE',
    v_purchase_id,
    'Purchased ' || v_item.name,
    timezone('utc'::text, now())
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'purchase', jsonb_build_object(
      'id', v_purchase_id,
      'character_id', v_character.id,
      'item_id', v_item.id,
      'price_paid', v_item.price,
      'purchased_at', timezone('utc'::text, now())
    ),
    'remaining_gold', v_new_gold,
    'item', jsonb_build_object(
      'id', v_item.id,
      'name', v_item.name,
      'category', v_item.category,
      'price', v_item.price,
      'rarity', v_item.rarity
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update complete_quest to award Gold and record EARN transactions
CREATE OR REPLACE FUNCTION public.complete_quest(p_quest_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_quest RECORD;
  v_character RECORD;
  v_old_level INT;
  v_new_xp INT;
  v_new_level INT;
  v_leveled_up BOOLEAN;
  v_attr_key VARCHAR(50);
  v_old_attr_level INT;
  v_new_attr_level INT;
  v_attr_leveled_up BOOLEAN;
  v_sp_earned INT := 0;
  v_total_sp INT := 0;
  v_skills_count INT := 0;
  v_max_attr_level INT := 1;
  v_new_evolution_tier INT := 1;
  v_new_evolution_title VARCHAR(100);
  v_evolution_changed BOOLEAN := false;
  v_today DATE := CURRENT_DATE;
  v_streak RECORD;
  v_new_streak INT := 1;
  v_longest_streak INT := 1;
  v_first_today BOOLEAN := false;
  v_streak_extended BOOLEAN := false;
  v_is_new_record BOOLEAN := false;
  v_chain_record RECORD;
  v_chain_step RECORD;
  v_chain_completed BOOLEAN := false;
  v_chain_progress JSONB := NULL;
  v_boss_obj RECORD;
  v_all_boss_objs_complete BOOLEAN;
  v_boss_quest RECORD;
  v_boss_defeat_result JSONB := NULL;
  v_gold_earned INT := 5;
  v_bonus_gold INT := 0;
  v_total_gold_earned INT := 0;
  v_new_gold INT := 0;
BEGIN
  -- Authenticate caller
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock quest record
  SELECT * INTO v_quest
  FROM public.quests
  WHERE id = p_quest_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest not found';
  END IF;

  IF v_quest.status = 'COMPLETED' THEN
    RAISE EXCEPTION 'Quest is already completed';
  END IF;

  -- Lock character record
  SELECT * INTO v_character
  FROM public.characters
  WHERE id = v_quest.character_id AND user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found';
  END IF;

  -- Mark quest completed
  UPDATE public.quests
  SET status = 'COMPLETED',
      completed_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE id = p_quest_id;

  -- Calculate XP and Level
  v_old_level := v_character.level;
  v_new_xp := v_character.xp + v_quest.xp_reward;
  v_new_level := public.calculate_level_from_xp(v_new_xp);
  v_leveled_up := v_new_level > v_old_level;

  IF v_leveled_up THEN
    v_sp_earned := v_sp_earned + (v_new_level - v_old_level);
  END IF;

  -- Attribute XP progression
  v_attr_key := public.category_to_attribute(v_quest.category);
  
  INSERT INTO public.character_attributes (character_id, user_id, attribute_key, level, xp)
  VALUES (v_character.id, v_user_id, v_attr_key, 1, 0)
  ON CONFLICT (character_id, attribute_key) DO NOTHING;

  SELECT level, xp INTO v_old_attr_level, v_new_xp
  FROM public.character_attributes
  WHERE character_id = v_character.id AND attribute_key = v_attr_key
  FOR UPDATE;

  v_new_xp := v_new_xp + v_quest.xp_reward;
  v_new_attr_level := public.calculate_attribute_level(v_new_xp);
  v_attr_leveled_up := v_new_attr_level > v_old_attr_level;

  IF v_attr_leveled_up THEN
    v_sp_earned := v_sp_earned + (v_new_attr_level - v_old_attr_level);
  END IF;

  UPDATE public.character_attributes
  SET level = v_new_attr_level,
      xp = v_new_xp,
      updated_at = timezone('utc'::text, now())
  WHERE character_id = v_character.id AND attribute_key = v_attr_key;

  -- Streak update
  SELECT * INTO v_streak
  FROM public.streaks
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date, freezes_available)
    VALUES (v_user_id, 1, 1, v_today, 1)
    RETURNING * INTO v_streak;
    v_new_streak := 1;
    v_longest_streak := 1;
    v_first_today := true;
    v_streak_extended := true;
    v_is_new_record := true;
  ELSE
    IF v_streak.last_activity_date IS NULL THEN
      v_new_streak := 1;
      v_first_today := true;
      v_streak_extended := true;
    ELSIF v_streak.last_activity_date = v_today THEN
      v_new_streak := v_streak.current_streak;
      v_first_today := false;
      v_streak_extended := false;
    ELSIF v_streak.last_activity_date = v_today - 1 THEN
      v_new_streak := v_streak.current_streak + 1;
      v_first_today := true;
      v_streak_extended := true;
    ELSE
      v_new_streak := 1;
      v_first_today := true;
      v_streak_extended := false;
    END IF;

    v_longest_streak := GREATEST(v_streak.longest_streak, v_new_streak);
    v_is_new_record := v_new_streak > v_streak.longest_streak;

    UPDATE public.streaks
    SET current_streak = v_new_streak,
        longest_streak = v_longest_streak,
        last_activity_date = v_today,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_streak.id;
  END IF;

  -- Quest Chain Progression
  SELECT qc.*, qcs.id as step_id, qcs.step_number
  INTO v_chain_record
  FROM public.quest_chain_steps qcs
  JOIN public.quest_chains qc ON qc.id = qcs.chain_id
  WHERE qcs.quest_id = p_quest_id AND qc.user_id = v_user_id;

  IF FOUND THEN
    UPDATE public.quest_chain_steps
    SET is_completed = true,
        completed_at = timezone('utc'::text, now())
    WHERE id = v_chain_record.step_id;

    IF NOT EXISTS (
      SELECT 1 FROM public.quest_chain_steps
      WHERE chain_id = v_chain_record.id AND is_completed = false
    ) THEN
      v_chain_completed := true;
      v_bonus_gold := v_bonus_gold + 50; -- +50 Gold for completing chain
      UPDATE public.quest_chains
      SET is_completed = true,
          completed_at = timezone('utc'::text, now()),
          updated_at = timezone('utc'::text, now())
      WHERE id = v_chain_record.id;
    END IF;

    v_chain_progress := jsonb_build_object(
      'chain_id', v_chain_record.id,
      'chain_title', v_chain_record.title,
      'step_number', v_chain_record.step_number,
      'is_chain_completed', v_chain_completed
    );
  END IF;

  -- Boss Quests Progression Check
  FOR v_boss_obj IN
    SELECT bo.id as obj_id, bo.boss_id
    FROM public.boss_objective_quests boq
    JOIN public.boss_objectives bo ON bo.id = boq.objective_id
    WHERE boq.quest_id = p_quest_id AND boq.user_id = v_user_id
  LOOP
    SELECT NOT EXISTS (
      SELECT 1
      FROM public.boss_objectives bo
      WHERE bo.boss_id = v_boss_obj.boss_id
        AND EXISTS (
          SELECT 1
          FROM public.boss_objective_quests boq2
          JOIN public.quests q2 ON q2.id = boq2.quest_id
          WHERE boq2.objective_id = bo.id AND q2.status != 'COMPLETED'
        )
    ) INTO v_all_boss_objs_complete;

    IF v_all_boss_objs_complete THEN
      SELECT * INTO v_boss_quest
      FROM public.boss_quests
      WHERE id = v_boss_obj.boss_id AND status = 'ACTIVE'
      FOR UPDATE;

      IF FOUND THEN
        UPDATE public.boss_quests
        SET status = 'COMPLETED',
            completed_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_boss_quest.id;

        -- Award Boss Gold
        IF v_boss_quest.difficulty = 'Legendary' THEN
          v_bonus_gold := v_bonus_gold + 250;
        ELSIF v_boss_quest.difficulty = 'Epic' THEN
          v_bonus_gold := v_bonus_gold + 100;
        ELSE
          v_bonus_gold := v_bonus_gold + 50;
        END IF;

        v_boss_defeat_result := jsonb_build_object(
          'boss_id', v_boss_quest.id,
          'boss_title', v_boss_quest.title,
          'difficulty', v_boss_quest.difficulty,
          'reward_xp', v_boss_quest.reward_xp,
          'completed_at', timezone('utc'::text, now()),
          'defeated', true
        );
      END IF;
    END IF;
  END LOOP;

  -- Calculate Quest Gold Rewards
  IF v_quest.difficulty = 'Hard' THEN
    v_gold_earned := 25;
  ELSIF v_quest.difficulty = 'Medium' THEN
    v_gold_earned := 10;
  ELSE
    v_gold_earned := 5;
  END IF;

  v_total_gold_earned := v_gold_earned + v_bonus_gold;
  v_new_gold := v_character.gold + v_total_gold_earned;

  -- Insert EARN transactions in economy_transactions
  INSERT INTO public.economy_transactions (
    character_id,
    user_id,
    type,
    amount,
    balance_after,
    source,
    reference_id,
    description,
    created_at
  ) VALUES (
    v_character.id,
    v_user_id,
    'EARN',
    v_gold_earned,
    v_character.gold + v_gold_earned,
    'QUEST_COMPLETION',
    v_quest.id,
    'Earned from quest: ' || v_quest.title,
    timezone('utc'::text, now())
  );

  IF v_bonus_gold > 0 THEN
    INSERT INTO public.economy_transactions (
      character_id,
      user_id,
      type,
      amount,
      balance_after,
      source,
      reference_id,
      description,
      created_at
    ) VALUES (
      v_character.id,
      v_user_id,
      'EARN',
      v_bonus_gold,
      v_new_gold,
      CASE WHEN v_boss_defeat_result IS NOT NULL THEN 'BOSS_COMPLETION' ELSE 'CHAIN_COMPLETION' END,
      v_quest.id,
      CASE WHEN v_boss_defeat_result IS NOT NULL THEN 'Bonus reward for defeating boss' ELSE 'Bonus reward for completing quest chain' END,
      timezone('utc'::text, now())
    );
  END IF;

  -- Character Skill Points and Evolution Update
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

  -- Update Character
  UPDATE public.characters
  SET xp = v_new_xp,
      level = v_new_level,
      skill_points = v_total_sp,
      gold = v_new_gold,
      evolution_tier = v_new_evolution_tier,
      evolution_title = v_new_evolution_title,
      updated_at = timezone('utc'::text, now())
  WHERE id = v_character.id;

  -- Return unified result
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
    'gold_awarded', v_total_gold_earned,
    'total_gold', v_new_gold,
    'character', jsonb_build_object(
      'id', v_character.id,
      'xp', v_new_xp,
      'level', v_new_level,
      'skill_points', v_total_sp,
      'gold', v_new_gold,
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
