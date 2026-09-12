import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { SEED_SHOP_ITEMS } from '../../../../src/shared/constants/economy';
import type {
  ShopItem,
  ShopItemWithOwnership,
  Purchase,
  EconomyTransaction,
  ItemCategory,
} from '../../../../src/shared/types/economy';
import { getCharacterByUserId, saveCharacter } from '../character/routes';

// In-memory data structures
const shopItemsMap = new Map<string, ShopItem>();
const purchases = new Map<string, Purchase>();
let economyTransactions: EconomyTransaction[] = [];

// Initialize shop items from curated seeds
function initShopItems(): void {
  shopItemsMap.clear();
  const now = new Date().toISOString();
  for (const seed of SEED_SHOP_ITEMS) {
    shopItemsMap.set(seed.id, {
      ...seed,
      createdAt: now,
      updatedAt: now,
    });
  }
}

// Initial seed
initShopItems();

export function getShopItems(): ShopItem[] {
  return Array.from(shopItemsMap.values());
}

export function getShopItemById(id: string): ShopItem | undefined {
  return shopItemsMap.get(id);
}

export function getPurchasesForCharacter(characterId: string): Purchase[] {
  return Array.from(purchases.values()).filter((p) => p.characterId === characterId);
}

export function getPurchasesForUser(userId: string): Purchase[] {
  return Array.from(purchases.values()).filter((p) => p.userId === userId);
}

export function isItemOwned(characterId: string, itemId: string): boolean {
  return Array.from(purchases.values()).some(
    (p) => p.characterId === characterId && p.itemId === itemId
  );
}

export function recordPurchase(purchase: Purchase): void {
  purchases.set(purchase.id, purchase);
}

export function recordTransaction(transaction: EconomyTransaction): void {
  economyTransactions.unshift(transaction);
}

export function getTransactionsForUser(userId: string): EconomyTransaction[] {
  return economyTransactions.filter((t) => t.userId === userId);
}

export function getTransactionsForCharacter(characterId: string): EconomyTransaction[] {
  return economyTransactions.filter((t) => t.characterId === characterId);
}

export function resetRewardsStore(): void {
  purchases.clear();
  economyTransactions = [];
  initShopItems();
}

// Mutex queues to serialize concurrent purchases per character (replicates PostgreSQL FOR UPDATE)
const characterPurchaseLocks = new Map<string, Promise<void>>();

async function acquireCharacterLock(characterId: string): Promise<() => void> {
  const currentLock = characterPurchaseLocks.get(characterId) || Promise.resolve();
  let release: () => void = () => {};
  const nextLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  characterPurchaseLocks.set(characterId, currentLock.then(() => nextLock));
  await currentLock;
  return release;
}

export const rewardRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // GET /shop - retrieve active shop items with ownership status
  app.get('/shop', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    const characterId = character?.id ?? '';

    const query = request.query as { category?: string; search?: string };
    const categoryFilter = query?.category as ItemCategory | undefined;
    const searchQuery = query?.search?.toLowerCase().trim();

    let items = getShopItems().filter((item) => item.isActive);

    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery)
      );
    }

    const itemsWithOwnership: ShopItemWithOwnership[] = items.map((item) => {
      const owned = characterId ? isItemOwned(characterId, item.id) : false;
      const purchaseRecord = owned
        ? Array.from(purchases.values()).find(
            (p) => p.characterId === characterId && p.itemId === item.id
          )
        : undefined;

      return {
        ...item,
        isOwned: owned,
        purchasedAt: purchaseRecord?.purchasedAt,
      };
    });

    return reply.status(200).send(itemsWithOwnership);
  });

  // GET /shop/:itemId - retrieve single item details with ownership
  app.get('/shop/:itemId', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { itemId } = request.params as { itemId: string };

    const item = getShopItemById(itemId);
    if (!item || !item.isActive) {
      return reply.status(404).send({ error: 'Item not found' });
    }

    const character = getCharacterByUserId(userId);
    const characterId = character?.id ?? '';
    const owned = characterId ? isItemOwned(characterId, item.id) : false;
    const purchaseRecord = owned
      ? Array.from(purchases.values()).find(
          (p) => p.characterId === characterId && p.itemId === item.id
        )
      : undefined;

    const result: ShopItemWithOwnership = {
      ...item,
      isOwned: owned,
      purchasedAt: purchaseRecord?.purchasedAt,
    };

    return reply.status(200).send(result);
  });

  // POST /shop/:itemId/purchase - atomic purchase execution with concurrency lock & ledger entry
  app.post('/shop/:itemId/purchase', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';
    const { itemId } = request.params as { itemId: string };

    const item = getShopItemById(itemId);
    if (!item || !item.isActive) {
      return reply.status(404).send({ error: 'Item not found or unavailable' });
    }

    const character = getCharacterByUserId(userId);
    if (!character) {
      return reply.status(400).send({ error: 'Character required to make purchases' });
    }

    // Acquire lock for this character to ensure serial execution (double-spend protection)
    const releaseLock = await acquireCharacterLock(character.id);

    try {
      // Re-read latest character state inside the lock
      const latestCharacter = getCharacterByUserId(userId);
      if (!latestCharacter) {
        return reply.status(400).send({ error: 'Character not found' });
      }

      // Check if already owned
      if (isItemOwned(latestCharacter.id, item.id)) {
        return reply.status(409).send({ error: 'Item already owned' });
      }

      // Check sufficient funds
      const currentGold = latestCharacter.gold ?? 0;
      if (currentGold < item.price) {
        return reply.status(400).send({
          error: 'Insufficient gold',
          required: item.price,
          available: currentGold,
        });
      }

      // Deduct balance
      const newGold = currentGold - item.price;
      latestCharacter.gold = newGold;
      latestCharacter.updatedAt = new Date().toISOString();
      saveCharacter(latestCharacter);

      // Create purchase record
      const now = new Date().toISOString();
      const purchase: Purchase = {
        id: randomUUID(),
        characterId: latestCharacter.id,
        userId,
        itemId: item.id,
        pricePaid: item.price,
        purchasedAt: now,
        item,
      };
      recordPurchase(purchase);

      // Record SPEND ledger transaction
      const transaction: EconomyTransaction = {
        id: randomUUID(),
        characterId: latestCharacter.id,
        userId,
        type: 'SPEND',
        amount: item.price,
        balanceAfter: newGold,
        source: 'SHOP_PURCHASE',
        referenceId: purchase.id,
        description: `Purchased ${item.name}`,
        createdAt: now,
      };
      recordTransaction(transaction);

      return reply.status(200).send({
        success: true,
        purchase,
        remainingGold: newGold,
        item,
      });
    } finally {
      releaseLock();
    }
  });

  // GET /economy/transactions - retrieve transaction ledger for user
  app.get('/economy/transactions', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const transactions = getTransactionsForUser(userId);
    return reply.status(200).send(transactions);
  });

  // GET /rewards - retrieve user reward summary
  app.get('/rewards', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').trim() : 'demo-user';

    const character = getCharacterByUserId(userId);
    const userTransactions = getTransactionsForUser(userId);
    const userPurchases = getPurchasesForUser(userId);

    const totalGold = character?.gold ?? 0;
    const totalEarned = userTransactions
      .filter((t) => t.type === 'EARN')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = userTransactions
      .filter((t) => t.type === 'SPEND')
      .reduce((sum, t) => sum + t.amount, 0);

    return reply.status(200).send({
      totalGold,
      totalEarned,
      totalSpent,
      recentTransactions: userTransactions.slice(0, 10),
      ownedItemsCount: userPurchases.length,
    });
  });
};
