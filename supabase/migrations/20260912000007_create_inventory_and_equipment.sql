-- ================================================================
-- Migration 007: Create Character Equipment and Inventory Slots
-- ================================================================

-- 1. Create public.character_equipment table
CREATE TABLE IF NOT EXISTS public.character_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slot VARCHAR(20) NOT NULL CHECK (slot IN ('AVATAR', 'THEME', 'BADGE', 'COSMETIC')),
    item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    equipped_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_character_equipment_slot UNIQUE (character_id, slot)
);

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_char_equipment_char ON public.character_equipment(character_id);
CREATE INDEX IF NOT EXISTS idx_char_equipment_user ON public.character_equipment(user_id);

-- 3. Row Level Security Policies
ALTER TABLE public.character_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own equipment" ON public.character_equipment;
CREATE POLICY "Users can view own equipment" ON public.character_equipment
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own equipment" ON public.character_equipment;
CREATE POLICY "Users can insert own equipment" ON public.character_equipment
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own equipment" ON public.character_equipment;
CREATE POLICY "Users can update own equipment" ON public.character_equipment
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own equipment" ON public.character_equipment;
CREATE POLICY "Users can delete own equipment" ON public.character_equipment
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Stored Procedure: equip_item(p_item_id UUID)
CREATE OR REPLACE FUNCTION public.equip_item(p_item_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_character RECORD;
  v_item RECORD;
  v_purchase RECORD;
  v_previous_equipped RECORD;
  v_slot VARCHAR(20);
BEGIN
  -- Authenticate caller
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify character exists
  SELECT * INTO v_character
  FROM public.characters
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found';
  END IF;

  -- Verify active item exists
  SELECT * INTO v_item
  FROM public.shop_items
  WHERE id = p_item_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not found or unavailable';
  END IF;

  -- Determine target slot based on item category
  v_slot := v_item.category;

  -- Enforce ownership: caller must have purchased this item
  SELECT * INTO v_purchase
  FROM public.purchases
  WHERE character_id = v_character.id AND item_id = p_item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Item not owned. You must purchase this item before equipping.';
  END IF;

  -- Capture previous equipped item in this slot (if any)
  SELECT * INTO v_previous_equipped
  FROM public.character_equipment
  WHERE character_id = v_character.id AND slot = v_slot;

  -- Atomic Upsert into character_equipment (replaces previous item in slot)
  INSERT INTO public.character_equipment (
    character_id,
    user_id,
    slot,
    item_id,
    purchase_id,
    equipped_at,
    updated_at
  ) VALUES (
    v_character.id,
    v_user_id,
    v_slot,
    v_item.id,
    v_purchase.id,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ) ON CONFLICT (character_id, slot) DO UPDATE SET
    item_id = EXCLUDED.item_id,
    purchase_id = EXCLUDED.purchase_id,
    equipped_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now());

  RETURN jsonb_build_object(
    'success', true,
    'equipped', jsonb_build_object(
      'itemId', v_item.id,
      'slot', v_slot,
      'name', v_item.name
    ),
    'replacedItemId', CASE WHEN v_previous_equipped.item_id IS NOT NULL AND v_previous_equipped.item_id != v_item.id THEN v_previous_equipped.item_id ELSE NULL END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Stored Procedure: unequip_item(p_slot VARCHAR)
CREATE OR REPLACE FUNCTION public.unequip_item(p_slot VARCHAR)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_character RECORD;
  v_existing RECORD;
BEGIN
  -- Authenticate caller
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify character exists
  SELECT * INTO v_character
  FROM public.characters
  WHERE user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Character not found';
  END IF;

  -- Verify slot is valid
  IF p_slot NOT IN ('AVATAR', 'THEME', 'BADGE', 'COSMETIC') THEN
    RAISE EXCEPTION 'Invalid equipment slot: %', p_slot;
  END IF;

  -- Check existing equipment
  SELECT ce.*, si.name as item_name
  INTO v_existing
  FROM public.character_equipment ce
  JOIN public.shop_items si ON si.id = ce.item_id
  WHERE ce.character_id = v_character.id AND ce.slot = p_slot;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No item currently equipped in slot: %', p_slot;
  END IF;

  -- Remove equipment assignment
  DELETE FROM public.character_equipment
  WHERE character_id = v_character.id AND slot = p_slot;

  RETURN jsonb_build_object(
    'success', true,
    'unequipped', jsonb_build_object(
      'itemId', v_existing.item_id,
      'slot', p_slot,
      'name', v_existing.item_name
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
