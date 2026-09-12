/**
 * Controlled demo data seeder for hackathon evaluation.
 * Seeds rich, realistic sample state across all 9 RPG systems.
 */

export function seedDemoData(userId: string): void {
  const now = new Date().toISOString();
  const todayDate = now.split('T')[0];
  const charId = `char-demo-${userId.slice(-6)}`;

  // 1. Character Profile
  const character = {
    id: charId,
    userId,
    name: 'Valerius Vanguard',
    avatar: 'shield',
    lifeFocus: 'health',
    xp: 350,
    level: 3,
    skillPoints: 2,
    evolutionTier: 1,
    evolutionTitle: 'Novice Vanguard',
    gold: 275,
    createdAt: '2026-09-08T08:00:00.000Z',
    updatedAt: now,
  };
  localStorage.setItem(`life_rpg_character_${userId}`, JSON.stringify(character));

  // 2. Quests
  const quests = [
    {
      id: 'quest-demo-1',
      userId,
      characterId: charId,
      title: 'Morning 5km High-Cadence Run',
      description: 'Cardio endurance and respiratory stamina training session.',
      category: 'Health',
      difficulty: 'Medium',
      xpReward: 50,
      status: 'COMPLETED',
      completedAt: '2026-09-12T07:30:00.000Z',
      createdAt: '2026-09-12T06:45:00.000Z',
      updatedAt: '2026-09-12T07:30:00.000Z',
    },
    {
      id: 'quest-demo-2',
      userId,
      characterId: charId,
      title: 'Read 25 Pages of Systems Architecture',
      description: 'Deep work study session focusing on distributed consensus.',
      category: 'Learning',
      difficulty: 'Easy',
      xpReward: 25,
      status: 'ACTIVE',
      createdAt: '2026-09-12T09:00:00.000Z',
      updatedAt: '2026-09-12T09:00:00.000Z',
    },
    {
      id: 'quest-demo-3',
      userId,
      characterId: charId,
      title: 'Organize Weekly Financial Budget Ledger',
      description: 'Audit expenditures and set personal weekly savings target.',
      category: 'Finance',
      difficulty: 'Hard',
      xpReward: 100,
      status: 'ACTIVE',
      createdAt: '2026-09-11T16:00:00.000Z',
      updatedAt: '2026-09-11T16:00:00.000Z',
    },
    {
      id: 'quest-demo-4',
      userId,
      characterId: charId,
      title: 'Meal Prep High-Protein Fuel',
      description: 'Prepare balanced meals for clean energy throughout the week.',
      category: 'Health',
      difficulty: 'Easy',
      xpReward: 25,
      status: 'COMPLETED',
      completedAt: '2026-09-11T19:00:00.000Z',
      createdAt: '2026-09-11T17:30:00.000Z',
      updatedAt: '2026-09-11T19:00:00.000Z',
    },
  ];
  localStorage.setItem(`life_rpg_quests_${userId}`, JSON.stringify(quests));

  // 3. Streak
  const streak = {
    currentStreak: 4,
    longestStreak: 7,
    lastActivityDate: todayDate,
    recoveryAvailable: true,
  };
  localStorage.setItem(`life_rpg_streak_${userId}`, JSON.stringify(streak));

  // 4. Quest Chain
  const chainId = 'chain-demo-1';
  const chains = [
    {
      id: chainId,
      userId,
      characterId: charId,
      title: 'Marathon Readiness Foundation',
      description: 'A 3-step progressive conditioning program to prepare for 10km race.',
      category: 'Health',
      status: 'ACTIVE',
      stepCount: 3,
      createdAt: '2026-09-08T09:00:00.000Z',
      updatedAt: now,
    },
  ];
  const chainSteps = [
    {
      id: 'step-demo-1',
      chainId,
      questId: 'quest-demo-1',
      stepOrder: 1,
      status: 'COMPLETED',
      createdAt: '2026-09-08T09:00:00.000Z',
      updatedAt: '2026-09-12T07:30:00.000Z',
    },
    {
      id: 'step-demo-2',
      chainId,
      questId: 'quest-demo-2',
      stepOrder: 2,
      status: 'AVAILABLE',
      createdAt: '2026-09-08T09:00:00.000Z',
      updatedAt: now,
    },
    {
      id: 'step-demo-3',
      chainId,
      questId: 'quest-demo-3',
      stepOrder: 3,
      status: 'LOCKED',
      createdAt: '2026-09-08T09:00:00.000Z',
      updatedAt: now,
    },
  ];
  localStorage.setItem(`life_rpg_chains_${userId}`, JSON.stringify(chains));
  localStorage.setItem(`life_rpg_chain_steps_${userId}`, JSON.stringify(chainSteps));

  // 5. Boss Encounter
  const bossId = 'boss-demo-1';
  const bossQuests = [
    {
      id: bossId,
      userId,
      characterId: charId,
      title: 'The Sloth Leviathan',
      description: 'A colossal manifestation of procrastination and fatigue. Defeat it by maintaining discipline across 3 vital objectives.',
      difficulty: 'Epic',
      rewardXp: 500,
      goldReward: 150,
      status: 'ACTIVE',
      createdAt: '2026-09-09T10:00:00.000Z',
      updatedAt: now,
    },
  ];
  const bossObjectives = [
    {
      id: 'obj-demo-1',
      bossId,
      title: 'Ignite the Cardio Engine',
      description: 'Conquer morning high-intensity run.',
      requiredProgress: 1,
      currentProgress: 1,
      isCompleted: true,
    },
    {
      id: 'obj-demo-2',
      bossId,
      title: 'Synthesize Architectural Knowledge',
      description: 'Read 25 pages of core material.',
      requiredProgress: 1,
      currentProgress: 0,
      isCompleted: false,
    },
  ];
  const bossLinks = [
    { bossId, objectiveId: 'obj-demo-1', questId: 'quest-demo-1' },
    { bossId, objectiveId: 'obj-demo-2', questId: 'quest-demo-2' },
  ];
  localStorage.setItem(`life_rpg_boss_quests_${userId}`, JSON.stringify(bossQuests));
  localStorage.setItem(`life_rpg_boss_objectives_${userId}`, JSON.stringify(bossObjectives));
  localStorage.setItem(`life_rpg_boss_links_${userId}`, JSON.stringify(bossLinks));

  // 6. Economy Transactions
  const transactions = [
    {
      id: 'tx-demo-1',
      characterId: charId,
      userId,
      type: 'EARN',
      amount: 50,
      balanceAfter: 275,
      source: 'QUEST_COMPLETION',
      description: 'Morning 5km High-Cadence Run conquered',
      createdAt: '2026-09-12T07:30:00.000Z',
    },
    {
      id: 'tx-demo-2',
      characterId: charId,
      userId,
      type: 'EARN',
      amount: 100,
      balanceAfter: 225,
      source: 'CHAIN_COMPLETION',
      description: 'Chain Step milestone achieved',
      createdAt: '2026-09-11T19:00:00.000Z',
    },
    {
      id: 'tx-demo-3',
      characterId: charId,
      userId,
      type: 'SPEND',
      amount: 75,
      balanceAfter: 125,
      source: 'SHOP_PURCHASE',
      description: 'Acquired Cyber Samurai avatar relic from Shop',
      createdAt: '2026-09-10T14:20:00.000Z',
    },
  ];
  localStorage.setItem(`life_rpg_transactions_${userId}`, JSON.stringify(transactions));

  // 7. Inventory Purchases & Equipment
  const samplePurchasedItem = {
    id: '80000000-0000-4000-8000-000000000001',
    name: 'Cyber Samurai',
    description: 'A futuristic cybernetic warrior who walks the disciplined code of digital bushido.',
    category: 'AVATAR',
    slot: 'AVATAR',
    price: 75,
    icon: 'Shield',
    rarity: 'RARE',
    assetRef: 'cyber-samurai',
    isActive: true,
    isOwned: true,
    purchaseId: 'purch-demo-1',
    purchasedAt: '2026-09-10T14:20:00.000Z',
  };
  localStorage.setItem(`life_rpg_purchases_${userId}`, JSON.stringify([samplePurchasedItem]));

  const equipmentMap = {
    AVATAR: samplePurchasedItem,
  };
  localStorage.setItem(`life_rpg_equipment_${userId}`, JSON.stringify(equipmentMap));

  // 8. Achievements
  const achievements = {
    '90000000-0000-4000-8000-000000000001': {
      id: 'ach-user-1',
      characterId: charId,
      userId,
      achievementId: '90000000-0000-4000-8000-000000000001',
      progress: 1,
      isUnlocked: true,
      unlockedAt: '2026-09-11T19:00:00.000Z',
    },
    '90000000-0000-4000-8000-000000000004': {
      id: 'ach-user-2',
      characterId: charId,
      userId,
      achievementId: '90000000-0000-4000-8000-000000000004',
      progress: 4,
      isUnlocked: true,
      unlockedAt: '2026-09-12T07:30:00.000Z',
    },
  };
  localStorage.setItem(`life_rpg_achievements_${userId}`, JSON.stringify(achievements));
}
