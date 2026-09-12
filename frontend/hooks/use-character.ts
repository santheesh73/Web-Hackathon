'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Character, CharacterCreationInput } from '@/../src/shared';
import { CharacterCreationSchema } from '@/../src/shared/schemas/character';

const LOCAL_STORAGE_CHAR_PREFIX = 'life_rpg_character_';

interface CharacterContextType {
  character: Character | null;
  loading: boolean;
  error: string | null;
  fetchCharacter: (userId: string) => Promise<Character | null>;
  createCharacter: (userId: string, input: CharacterCreationInput) => Promise<{ success: boolean; error?: string; character?: Character }>;
}

export function useCharacter(): CharacterContextType {
  const [character, setCharacter] = React.useState<Character | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchCharacter = React.useCallback(
    async (userId: string): Promise<Character | null> => {
      if (!userId) return null;
      setLoading(true);
      setError(null);

      try {
        if (configured) {
          const supabase = getSupabaseClient();
          const { data, error: fetchErr } = await supabase
            .from('characters')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          if (fetchErr) {
            console.error('Error fetching character:', fetchErr.message);
            setError(fetchErr.message);
            setLoading(false);
            return null;
          }

          if (data) {
            const mapped: Character = {
              id: data.id,
              userId: data.user_id,
              name: data.name,
              avatar: data.avatar,
              lifeFocus: data.life_focus,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            setCharacter(mapped);
            setLoading(false);
            return mapped;
          }

          setCharacter(null);
          setLoading(false);
          return null;
        } else {
          // Local storage fallback
          const stored = localStorage.getItem(`${LOCAL_STORAGE_CHAR_PREFIX}${userId}`);
          if (stored) {
            const parsed: Character = JSON.parse(stored);
            setCharacter(parsed);
            setLoading(false);
            return parsed;
          }
          setCharacter(null);
          setLoading(false);
          return null;
        }
      } catch (err) {
        console.error('Fetch character error:', err);
        setError('Failed to load character.');
        setLoading(false);
        return null;
      }
    },
    [configured]
  );

  const createCharacter = async (
    userId: string,
    input: CharacterCreationInput
  ): Promise<{ success: boolean; error?: string; character?: Character }> => {
    setLoading(true);
    setError(null);

    // Validate input with shared Zod schema
    const validation = CharacterCreationSchema.safeParse(input);
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Invalid character data.';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // 1. Duplicate check: Does a character already exist for this user?
        const { data: existing } = await supabase
          .from('characters')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          const duplicateMsg = 'A character already exists for this account.';
          setError(duplicateMsg);
          setLoading(false);
          return { success: false, error: duplicateMsg };
        }

        // 2. Insert new character
        const { data, error: insertErr } = await supabase
          .from('characters')
          .insert({
            user_id: userId,
            name: input.name,
            avatar: input.avatar,
            life_focus: input.lifeFocus,
          })
          .select()
          .single();

        if (insertErr) {
          setError(insertErr.message);
          setLoading(false);
          return { success: false, error: insertErr.message };
        }

        const newChar: Character = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          avatar: data.avatar,
          lifeFocus: data.life_focus,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        setCharacter(newChar);
        setLoading(false);
        return { success: true, character: newChar };
      } else {
        // Local storage mode: enforce 1 character per user
        const key = `${LOCAL_STORAGE_CHAR_PREFIX}${userId}`;
        const existing = localStorage.getItem(key);
        if (existing) {
          const duplicateMsg = 'A character already exists for this account.';
          setError(duplicateMsg);
          setLoading(false);
          return { success: false, error: duplicateMsg };
        }

        const newChar: Character = {
          id: 'char-' + Date.now(),
          userId,
          name: input.name,
          avatar: input.avatar,
          lifeFocus: input.lifeFocus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(key, JSON.stringify(newChar));
        setCharacter(newChar);
        setLoading(false);
        return { success: true, character: newChar };
      }
    } catch {
      const fallbackErr = 'Failed to create character. Please try again.';
      setError(fallbackErr);
      setLoading(false);
      return { success: false, error: fallbackErr };
    }
  };

  return {
    character,
    loading,
    error,
    fetchCharacter,
    createCharacter,
  };
}
