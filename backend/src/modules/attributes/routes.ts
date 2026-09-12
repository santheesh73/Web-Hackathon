import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  ATTRIBUTE_KEYS,
  getAttributeProgress,
  getAttributeLevelFromXp,
} from '../../../../src/shared/constants/attributes';
import { buildEvolutionProfile } from '../../../../src/shared/constants/evolution';
import type {
  AttributeKey,
  CharacterAttribute,
  AttributeProgressInfo,
} from '../../../../src/shared/types/attribute';
import { getCharacterByUserId } from '../character/routes';
import { getUnlockedSkills } from '../skill-tree/routes';

// In-memory store for user attributes: userId -> Map<AttributeKey, CharacterAttribute>
export const attributesByUserId = new Map<string, Map<AttributeKey, CharacterAttribute>>();

export function initializeDefaultAttributes(
  userId: string,
  characterId: string,
  lifeFocus?: string
): Map<AttributeKey, CharacterAttribute> {
  const map = new Map<AttributeKey, CharacterAttribute>();
  const now = new Date().toISOString();

  for (const key of ATTRIBUTE_KEYS) {
    // Focus bonus: +25 XP starting head start on life focus category
    let initialXp = 0;
    if (lifeFocus) {
      const focusCategoryKey =
        lifeFocus === 'health'
          ? 'STRENGTH'
          : lifeFocus === 'learning'
          ? 'INTELLIGENCE'
          : lifeFocus === 'career'
          ? 'DISCIPLINE'
          : lifeFocus === 'finance'
          ? 'WISDOM'
          : lifeFocus === 'creativity'
          ? 'CREATIVITY'
          : 'RESILIENCE';
      if (key === focusCategoryKey) {
        initialXp = 25;
      }
    }

    const attr: CharacterAttribute = {
      id: `attr-${userId}-${key.toLowerCase()}`,
      characterId,
      userId,
      attributeKey: key,
      xp: initialXp,
      level: getAttributeLevelFromXp(initialXp),
      createdAt: now,
      updatedAt: now,
    };
    map.set(key, attr);
  }

  attributesByUserId.set(userId, map);
  return map;
}

export function getCharacterAttributes(
  userId: string,
  characterId?: string
): CharacterAttribute[] {
  let userAttrs = attributesByUserId.get(userId);
  if (!userAttrs) {
    const character = getCharacterByUserId(userId);
    const charId = characterId || character?.id || `char-${userId}`;
    userAttrs = initializeDefaultAttributes(userId, charId, character?.lifeFocus);
  }
  return Array.from(userAttrs.values());
}

export function getAttributeByKey(
  userId: string,
  key: AttributeKey
): CharacterAttribute {
  let userAttrs = attributesByUserId.get(userId);
  if (!userAttrs) {
    const character = getCharacterByUserId(userId);
    userAttrs = initializeDefaultAttributes(
      userId,
      character?.id || `char-${userId}`,
      character?.lifeFocus
    );
  }
  let attr = userAttrs.get(key);
  if (!attr) {
    const now = new Date().toISOString();
    attr = {
      id: `attr-${userId}-${key.toLowerCase()}`,
      characterId: `char-${userId}`,
      userId,
      attributeKey: key,
      xp: 0,
      level: 1,
      createdAt: now,
      updatedAt: now,
    };
    userAttrs.set(key, attr);
  }
  return attr;
}

export function saveCharacterAttribute(
  userId: string,
  attribute: CharacterAttribute
): void {
  let userAttrs = attributesByUserId.get(userId);
  if (!userAttrs) {
    userAttrs = new Map<AttributeKey, CharacterAttribute>();
    attributesByUserId.set(userId, userAttrs);
  }
  userAttrs.set(attribute.attributeKey, attribute);
}

export const attributeRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /character/attributes - retrieve all 6 character attributes with progression info
  app.get('/character/attributes', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const attributes = getCharacterAttributes(userId);
    const progressMap: Record<AttributeKey, AttributeProgressInfo> = {} as Record<
      AttributeKey,
      AttributeProgressInfo
    >;

    for (const attr of attributes) {
      progressMap[attr.attributeKey] = getAttributeProgress(
        attr.attributeKey,
        attr.xp
      );
    }

    return reply.status(200).send({
      attributes,
      progress: progressMap,
    });
  });

  // GET /character/evolution - retrieve character evolution profile and ascension requirements
  app.get('/character/evolution', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    const avatar = character?.avatar || 'warrior';
    const level = character?.level || 1;
    const unlockedSkills = getUnlockedSkills(userId);
    const attributes = getCharacterAttributes(userId);
    const maxAttrLevel = Math.max(...attributes.map((a) => a.level), 1);

    const evolution = buildEvolutionProfile(
      avatar,
      level,
      unlockedSkills.length,
      maxAttrLevel
    );

    return reply.status(200).send({ evolution });
  });
};
