'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import type {
  CharacterAttribute,
  AttributeProgressInfo,
  AttributeKey,
} from '@/../src/shared/types/attribute';
import type { EvolutionProfile } from '@/../src/shared/types/evolution';
import {
  ATTRIBUTE_KEYS,
  getAttributeProgress,
  getAttributeLevelFromXp,
} from '@/../src/shared/constants/attributes';
import { buildEvolutionProfile } from '@/../src/shared/constants/evolution';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useAttributes() {
  const { user } = useAuth();
  const [attributes, setAttributes] = React.useState<CharacterAttribute[]>([]);
  const [progress, setProgress] = React.useState<Record<AttributeKey, AttributeProgressInfo>>(
    {} as Record<AttributeKey, AttributeProgressInfo>
  );
  const [evolution, setEvolution] = React.useState<EvolutionProfile | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAttributes = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Attempt Fastify backend fetch
      const attrRes = await fetch(`${BACKEND_URL}/character/attributes`, {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      const evoRes = await fetch(`${BACKEND_URL}/character/evolution`, {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (attrRes.ok && evoRes.ok) {
        const attrData = await attrRes.json();
        const evoData = await evoRes.json();

        setAttributes(attrData.attributes);
        setProgress(attrData.progress);
        setEvolution(evoData.evolution);
        setLoading(false);
        return;
      }
    } catch {
      // Backend not reached, fall through to localStorage fallback
    }

    // 2. Offline / LocalStorage fallback
    try {
      const charKey = `life_rpg_character_${user.id}`;
      const charStored = localStorage.getItem(charKey);
      const character = charStored ? JSON.parse(charStored) : { level: 1, avatar: 'warrior' };

      const attrKey = `life_rpg_attributes_${user.id}`;
      const attrStored = localStorage.getItem(attrKey);
      let attrList: CharacterAttribute[] = [];

      if (attrStored) {
        attrList = JSON.parse(attrStored);
      } else {
        const now = new Date().toISOString();
        attrList = ATTRIBUTE_KEYS.map((k) => ({
          id: `attr-${user.id}-${k.toLowerCase()}`,
          characterId: character.id || `char-${user.id}`,
          userId: user.id,
          attributeKey: k,
          xp: 0,
          level: 1,
          createdAt: now,
          updatedAt: now,
        }));
        localStorage.setItem(attrKey, JSON.stringify(attrList));
      }

      const progMap: Record<AttributeKey, AttributeProgressInfo> = {} as Record<
        AttributeKey,
        AttributeProgressInfo
      >;
      for (const a of attrList) {
        progMap[a.attributeKey] = getAttributeProgress(a.attributeKey, a.xp);
      }

      const skillsKey = `life_rpg_unlocked_skills_${user.id}`;
      const skillsStored = localStorage.getItem(skillsKey);
      const unlockedSkillIds: string[] = skillsStored ? JSON.parse(skillsStored) : [];
      const maxAttrLevel = Math.max(...attrList.map((a) => a.level), 1);

      const evoProfile = buildEvolutionProfile(
        character.avatar || 'warrior',
        character.level || 1,
        unlockedSkillIds.length,
        maxAttrLevel
      );

      setAttributes(attrList);
      setProgress(progMap);
      setEvolution(evoProfile);
    } catch (e: any) {
      setError(e.message || 'Failed to load attributes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  return {
    attributes,
    progress,
    evolution,
    loading,
    error,
    refetch: fetchAttributes,
  };
}
