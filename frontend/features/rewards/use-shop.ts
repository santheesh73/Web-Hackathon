'use client';

import * as React from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/hooks/use-character';
import type {
  ShopItem,
  ShopItemWithOwnership,
  Purchase,
  EconomyTransaction,
  PurchaseResult,
  RewardsSummary,
  ItemCategory,
} from '@/../src/shared/types/economy';
import { SEED_SHOP_ITEMS } from '@/../src/shared/constants/economy';
import type { ShopCategoryTab } from './types';

const PURCHASES_KEY_PREFIX = 'life_rpg_purchases_';
const TRANSACTIONS_KEY_PREFIX = 'life_rpg_transactions_';

export function useShop() {
  const { user } = useAuth();
  const { character, fetchCharacter } = useCharacter();
  const [items, setItems] = React.useState<ShopItemWithOwnership[]>([]);
  const [transactions, setTransactions] = React.useState<EconomyTransaction[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [purchasingItemId, setPurchasingItemId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<ShopCategoryTab>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const configured = isSupabaseConfigured();

  const fetchShopData = React.useCallback(async () => {
    if (!user) {
      setItems([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // 1. Fetch shop items
        const { data: itemsData, error: itemsErr } = await supabase
          .from('shop_items')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (itemsErr) {
          setError(itemsErr.message);
          setLoading(false);
          return;
        }

        // 2. Fetch user's purchases
        const { data: purchasesData } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id);

        const ownedItemIds = new Set((purchasesData || []).map((p: { item_id: string }) => p.item_id));

        const mappedItems: ShopItemWithOwnership[] = (itemsData || []).map((row: any) => ({
          id: row.id,
          key: row.key,
          name: row.name,
          description: row.description,
          category: row.category as ItemCategory,
          price: row.price,
          icon: row.icon,
          previewColor: row.preview_color,
          rarity: row.rarity,
          metadata: row.metadata,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          isOwned: ownedItemIds.has(row.id),
        }));

        setItems(mappedItems);

        // 3. Fetch user's economy transactions
        const { data: txData } = await supabase
          .from('economy_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        const mappedTxs: EconomyTransaction[] = (txData || []).map((row: any) => ({
          id: row.id,
          characterId: row.character_id,
          userId: row.user_id,
          type: row.type,
          amount: row.amount,
          balanceAfter: row.balance_after,
          source: row.source,
          referenceId: row.reference_id,
          description: row.description,
          createdAt: row.created_at,
        }));

        setTransactions(mappedTxs);
      } else {
        // LocalStorage fallback mode
        const pKey = `${PURCHASES_KEY_PREFIX}${user.id}`;
        const txKey = `${TRANSACTIONS_KEY_PREFIX}${user.id}`;

        const storedPurchases: Purchase[] = JSON.parse(localStorage.getItem(pKey) || '[]');
        const storedTxs: EconomyTransaction[] = JSON.parse(localStorage.getItem(txKey) || '[]');

        const ownedIds = new Set(storedPurchases.map((p) => p.itemId));

        const localItems: ShopItemWithOwnership[] = SEED_SHOP_ITEMS.map((seed) => ({
          ...seed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOwned: ownedIds.has(seed.id),
        }));

        setItems(localItems);
        setTransactions(storedTxs);
      }
    } catch {
      setError('Failed to load shop catalog');
    } finally {
      setLoading(false);
    }
  }, [user, configured]);

  React.useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  // Execute purchase
  const purchaseItem = async (item: ShopItem): Promise<PurchaseResult> => {
    if (!user || !character) {
      return { success: false, error: 'Character required to make purchases' };
    }

    const currentGold = character.gold ?? 0;
    if (currentGold < item.price) {
      return {
        success: false,
        error: `Insufficient Gold. You need ${item.price - currentGold} more Gold.`,
      };
    }

    const alreadyOwned = items.some((i) => i.id === item.id && i.isOwned);
    if (alreadyOwned) {
      return { success: false, error: 'You already own this item.' };
    }

    setPurchasingItemId(item.id);
    setError(null);

    try {
      if (configured) {
        const supabase = getSupabaseClient();

        // Stored procedure guarantees server-authoritative balance check & row lock
        const { data, error: rpcErr } = await supabase.rpc('purchase_shop_item', {
          p_item_id: item.id,
        });

        if (rpcErr) {
          setError(rpcErr.message);
          return { success: false, error: rpcErr.message };
        }

        // Refresh character balance and shop items
        await fetchCharacter(user.id);
        await fetchShopData();

        return {
          success: true,
          purchase: data.purchase,
          remainingGold: data.remaining_gold,
          item,
        };
      } else {
        // LocalStorage fallback purchase flow
        const charKey = `life_rpg_character_${user.id}`;
        const pKey = `${PURCHASES_KEY_PREFIX}${user.id}`;
        const txKey = `${TRANSACTIONS_KEY_PREFIX}${user.id}`;

        const storedChar = JSON.parse(localStorage.getItem(charKey) || '{}');
        const storedPurchases: Purchase[] = JSON.parse(localStorage.getItem(pKey) || '[]');
        const storedTxs: EconomyTransaction[] = JSON.parse(localStorage.getItem(txKey) || '[]');

        const newGold = Math.max(0, (storedChar.gold || 0) - item.price);
        storedChar.gold = newGold;
        storedChar.updatedAt = new Date().toISOString();
        localStorage.setItem(charKey, JSON.stringify(storedChar));

        const now = new Date().toISOString();
        const purchaseRecord: Purchase = {
          id: 'purch-' + Date.now(),
          characterId: character.id,
          userId: user.id,
          itemId: item.id,
          pricePaid: item.price,
          purchasedAt: now,
          item,
        };
        storedPurchases.push(purchaseRecord);
        localStorage.setItem(pKey, JSON.stringify(storedPurchases));

        const txRecord: EconomyTransaction = {
          id: 'tx-' + Date.now(),
          characterId: character.id,
          userId: user.id,
          type: 'SPEND',
          amount: item.price,
          balanceAfter: newGold,
          source: 'SHOP_PURCHASE',
          referenceId: purchaseRecord.id,
          description: `Purchased ${item.name}`,
          createdAt: now,
        };
        storedTxs.unshift(txRecord);
        localStorage.setItem(txKey, JSON.stringify(storedTxs));

        // Refresh character in React state
        await fetchCharacter(user.id);

        // Update local items state
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isOwned: true } : i))
        );
        setTransactions(storedTxs);

        return {
          success: true,
          purchase: purchaseRecord,
          remainingGold: newGold,
          item,
        };
      }
    } catch {
      const msg = 'Purchase transaction failed';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setPurchasingItemId(null);
    }
  };

  // Filter items by category tab and search input
  const filteredItems = React.useMemo(() => {
    let result = items;
    if (selectedCategory !== 'ALL') {
      result = result.filter((i) => i.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, selectedCategory, searchQuery]);

  // Derived metrics for summary
  const summary: RewardsSummary = React.useMemo(() => {
    const totalGold = character?.gold ?? 0;
    const totalEarned = transactions
      .filter((t) => t.type === 'EARN')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions
      .filter((t) => t.type === 'SPEND')
      .reduce((sum, t) => sum + t.amount, 0);
    const ownedItemsCount = items.filter((i) => i.isOwned).length;

    return {
      totalGold,
      totalEarned,
      totalSpent,
      recentTransactions: transactions.slice(0, 10),
      ownedItemsCount,
    };
  }, [character?.gold, transactions, items]);

  return {
    items: filteredItems,
    allItems: items,
    transactions,
    summary,
    loading,
    purchasingItemId,
    error,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    purchaseItem,
    refetch: fetchShopData,
  };
}
