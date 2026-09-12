import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { CharacterCreationSchema } from '../../../../src/shared/schemas/character';
import type { Character } from '../../../../src/shared/types/character';

// In-memory store for backend test validation and offline development
export const charactersByUserId = new Map<string, Character>();

export function getCharacterByUserId(userId: string): Character | undefined {
  return charactersByUserId.get(userId);
}

export function saveCharacter(character: Character): void {
  charactersByUserId.set(character.userId, character);
}

export const characterRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /character - retrieve authenticated user's character
  app.get('/character', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = charactersByUserId.get(userId);
    if (!character) {
      return reply.status(404).send({ error: 'Character not found' });
    }

    return reply.status(200).send(character);
  });

  // POST /character - create character with strict ownership
  app.post('/character', async (request, reply) => {
    const authHeader = request.headers.authorization;
    // User identity is determined by server / auth header, NEVER trusted from request body
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    // 1. Check for duplicate character
    if (charactersByUserId.has(userId)) {
      return reply.status(409).send({ error: 'Character already exists for this account' });
    }

    // 2. Validate input schema
    const parsed = CharacterCreationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: parsed.error.errors.map((e) => e.message),
      });
    }

    const { name, avatar, lifeFocus } = parsed.data;

    const newCharacter: Character = {
      id: 'char-' + Date.now(),
      userId,
      name,
      avatar,
      lifeFocus,
      xp: 0,
      level: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    charactersByUserId.set(userId, newCharacter);
    return reply.status(201).send(newCharacter);
  });
};
