# API Endpoints

## Base URL
- Development: `http://localhost:4000`

## Endpoints

### Health Check
- **Method**: `GET`
- **Path**: `/health`
- **Description**: Verifies API availability and service status.
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "life-rpg-api"
  }
  ```

---

### Character Retrieval
- **Method**: `GET`
- **Path**: `/character`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves the authenticated user's persistent character profile.
- **Response**:
  ```json
  {
    "id": "char-123456789",
    "userId": "user-uuid",
    "name": "Valerius",
    "avatar": "warrior",
    "lifeFocus": "learning",
    "xp": 100,
    "level": 2,
    "createdAt": "2026-09-12T00:00:00.000Z",
    "updatedAt": "2026-09-12T00:00:00.000Z"
  }
  ```

### Character Creation
- **Method**: `POST`
- **Path**: `/character`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new persistent character for the authenticated user. Enforces strict ownership and prevents duplicates (1 character per account).
- **Request Body**:
  ```json
  {
    "name": "Valerius",
    "avatar": "warrior",
    "lifeFocus": "learning"
  }
  ```
- **Response (201 Created)**: Returns the newly created `Character` object with default `xp: 0` and `level: 1`.
- **Response (409 Conflict)**: Returned if the user already has an active character.

---

### Quests Listing & Filtering
- **Method**: `GET`
- **Path**: `/quests[?status=ACTIVE|COMPLETED]`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves quests owned by the authenticated user, optionally filtered by status.
- **Response (200 OK)**: Array of `Quest` objects.

### Quest Details
- **Method**: `GET`
- **Path**: `/quests/:questId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves a single quest owned by the authenticated user.
- **Response (200 OK)**: `Quest` object.
- **Response (404 Not Found)**: If quest does not exist or belongs to another user.

### Quest Creation
- **Method**: `POST`
- **Path**: `/quests`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new real-life quest. XP is authoritatively assigned by the server (Easy: 25, Medium: 50, Hard: 100).
- **Request Body**:
  ```json
  {
    "title": "Study TypeScript Generics",
    "description": "Complete chapter 4 exercises",
    "category": "Learning",
    "difficulty": "Hard",
    "dueDate": "2026-09-14"
  }
  ```
- **Response (201 Created)**: Returns the newly created `Quest` object.

---

### Quest Completion (Atomic Multi-System Progression)
- **Method**: `POST`
- **Path**: `/quest-completion`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Atomically completes a quest, awards XP, updates level, processes daily streak activity, updates consecutive streak count, and advances quest chain steps.
- **Request Body**:
  ```json
  {
    "questId": "quest-1789203015420-vh043"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "quest": {
      "id": "quest-1789203015420-vh043",
      "status": "COMPLETED",
      "completedAt": "2026-09-12T08:50:15.000Z"
    },
    "xpAwarded": 100,
    "character": {
      "id": "char-123",
      "xp": 100,
      "level": 2
    },
    "previousLevel": 1,
    "newLevel": 2,
    "leveledUp": true,
    "streak": {
      "currentStreak": 1,
      "longestStreak": 1,
      "firstToday": true,
      "streakExtended": false,
      "isNewRecord": true
    },
    "chainProgress": {
      "chainId": "chain-123",
      "chainTitle": "Full Stack Mastery",
      "completedStepOrder": 1,
      "totalSteps": 3,
      "completedSteps": 1,
      "isChainCompleted": false,
      "nextStepOrder": 2
    }
  }
  ```
- **Response (400 Bad Request)**: If the quest belongs to a locked chain step (`Cannot complete locked quest chain step`).
- **Response (409 Conflict)**: If the quest was already completed (prevents duplicate completion and duplicate XP).

---

### Streak Summary
- **Method**: `GET`
- **Path**: `/streak`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves current streak, longest streak, status (`ACTIVE`, `AT_RISK`, `BROKEN`, `NONE`), and 30-day activity count.
- **Response (200 OK)**:
  ```json
  {
    "streak": {
      "id": "streak-123",
      "userId": "user-uuid",
      "currentStreak": 5,
      "longestStreak": 10,
      "lastActivityDate": "2026-09-12",
      "recoveryAvailable": true
    },
    "status": "ACTIVE",
    "isAtRisk": false,
    "daysActiveLast30Days": 14
  }
  ```

### Streak Calendar Heatmap
- **Method**: `GET`
- **Path**: `/streak/calendar[?days=30]`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns activity grid for the requested period (default 30 days) with date, completion count, and recovery indicators.
- **Response (200 OK)**: Array of `StreakCalendarDay` objects.

### Streak Recovery
- **Method**: `POST`
- **Path**: `/streak/recover`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Server-controlled recovery of a broken streak when exactly 1 day was missed. Consumes the user's recovery shield.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Streak successfully recovered! Your consistency is preserved.",
    "recoveredDate": "2026-09-11",
    "newStreak": 6,
    "recoveryAvailable": false
  }
  ```
- **Response (400 Bad Request)**: When not eligible (missed > 1 day or no missed day).
- **Response (409 Conflict)**: When recovery shield was already consumed.

---

### Quest Chains Listing
- **Method**: `GET`
- **Path**: `/quest-chains`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Lists all quest chains owned by the user with step progression and completion percentages.
- **Response (200 OK)**: Array of `QuestChainWithSteps`.

### Quest Chain Creation
- **Method**: `POST`
- **Path**: `/quest-chains`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new quest chain with ordered steps. Step 1 is set to `AVAILABLE`, and all subsequent steps start `LOCKED`.
- **Request Body**:
  ```json
  {
    "title": "Master Full-Stack Web Development",
    "description": "From fundamentals to production",
    "steps": [
      { "title": "Learn React Hooks", "category": "Learning", "difficulty": "Easy" },
      { "title": "Build Fastify API", "category": "Learning", "difficulty": "Medium" },
      { "title": "Deploy Cloud Architecture", "category": "Career", "difficulty": "Hard" }
    ]
  }
  ```
- **Response (201 Created)**: Returns the newly created `QuestChainWithSteps` object.

### Quest Chain Details
- **Method**: `GET`
- **Path**: `/quest-chains/:chainId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves a single quest chain with all steps, step statuses, and quest metadata.
- **Response (200 OK)**: `QuestChainWithSteps` object.
- **Response (404 Not Found)**: If chain does not exist or belongs to another user.

---

### Character Attributes
- **Method**: `GET`
- **Path**: `/character/attributes`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves all 6 lifestyle character attributes (`STRENGTH`, `INTELLIGENCE`, `DISCIPLINE`, `WISDOM`, `CREATIVITY`, `RESILIENCE`) with current XP, levels, and level-progress calculations.
- **Response (200 OK)**:
  ```json
  {
    "attributes": [
      {
        "id": "attr-demo-strength",
        "characterId": "char-demo",
        "userId": "demo-user",
        "attributeKey": "STRENGTH",
        "xp": 125,
        "level": 2,
        "createdAt": "2026-09-12T00:00:00.000Z",
        "updatedAt": "2026-09-12T00:00:00.000Z"
      }
    ],
    "progress": {
      "STRENGTH": {
        "attributeKey": "STRENGTH",
        "level": 2,
        "xp": 125,
        "currentLevelBaseXp": 50,
        "nextLevelXp": 150,
        "xpInCurrentLevel": 75,
        "xpNeededForNextLevel": 100,
        "progressPercent": 75
      }
    }
  }
  ```

### Character Evolution
- **Method**: `GET`
- **Path**: `/character/evolution`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves character evolution profile, current ascension tier (1 to 4), archetype title, frame/aura classes, and next tier milestone requirements.
- **Response (200 OK)**:
  ```json
  {
    "evolution": {
      "tier": 2,
      "title": "Blade Vanguard",
      "archetype": "warrior",
      "avatar": "warrior",
      "frameClass": "border-indigo-200 bg-indigo-50/30",
      "auraClass": "ring-2 ring-indigo-400/60 shadow-md",
      "tierName": "Adept",
      "unlockedPerks": [],
      "nextTier": {
        "tier": 3,
        "minLevel": 10,
        "minSkills": 6,
        "minAttributeLevel": 5,
        "levelMet": false,
        "skillsMet": false,
        "attributesMet": false,
        "allMet": false,
        "progressPercent": 35
      }
    }
  }
  ```

---

### Skill Tree Data
- **Method**: `GET`
- **Path**: `/skill-tree`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves all 18 skill nodes across 6 attribute branches with user unlock status, availability state, and missing prerequisites.
- **Response (200 OK)**:
  ```json
  {
    "availableSkillPoints": 2,
    "spentSkillPoints": 1,
    "totalSkillPoints": 3,
    "unlockedSkillIds": ["str_t1_endurance"],
    "branches": [
      {
        "attributeKey": "STRENGTH",
        "label": "Strength & Vitality",
        "skills": [
          {
            "id": "str_t1_endurance",
            "attributeKey": "STRENGTH",
            "tier": 1,
            "title": "Endurance Engine",
            "description": "Optimize metabolic stamina, physical recovery, and baseline vitality.",
            "spCost": 1,
            "requiredAttributeLevel": 1,
            "prerequisiteSkillId": null,
            "iconName": "Heart",
            "perkEffect": "+5% XP gained on Health quests",
            "isUnlocked": true,
            "canUnlock": false,
            "missingRequirements": []
          }
        ]
      }
    ]
  }
  ```

### Skill Unlock (Attunement)
- **Method**: `POST`
- **Path**: `/skill-tree/unlock`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Server-authoritative unlocking of a skill node. Validates available SP, required attribute level, and prerequisite unlocks. Recalculates evolution tier.
- **Request Body**:
  ```json
  {
    "skillId": "str_t1_endurance"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "skillId": "str_t1_endurance",
    "unlockedSkillTitle": "Endurance Engine",
    "availableSkillPoints": 1,
    "spentSkillPoints": 1,
    "unlockedSkillIds": ["str_t1_endurance"],
    "evolutionTier": 1,
    "evolutionTitle": "Vanguard Recruit",
    "newEvolutionUnlocked": false
  }
  ```
- **Response (400 Bad Request)**: Insufficient SP, attribute level requirement not met, or prerequisite skill locked.
- **Response (409 Conflict)**: Skill is already unlocked.

---

## Phase 6: Boss Quest System

### List Boss Quests
- **Method**: `GET`
- **Path**: `/boss-quests`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves all user's Boss Quests with computed objective progress percentages, linked quests, and defeat statuses.
- **Response (200 OK)**: Array of `BossQuestWithDetails`.

### Create Boss Quest
- **Method**: `POST`
- **Path**: `/boss-quests`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new Boss Quest with ordered milestone objectives. Reward XP is strictly server-authoritative based on difficulty (`Rare`: 250 XP, `Epic`: 500 XP, `Legendary`: 1000 XP).
- **Request Body**:
  ```json
  {
    "title": "Launch My Portfolio",
    "description": "Design, build, populate and deploy portfolio",
    "difficulty": "Epic",
    "deadline": "2026-10-01",
    "objectives": [
      { "title": "Design System", "requiredProgress": 1 },
      { "title": "Frontend Implementation", "requiredProgress: 2 }
    ]
  }
  ```
- **Response (201 Created)**: Created `BossQuestWithDetails`.

### Get Boss Quest Details
- **Method**: `GET`
- **Path**: `/boss-quests/:bossId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves detailed information for a single Boss Quest.
- **Response (200 OK)**: `BossQuestWithDetails`.
- **Response (404 Not Found)**: Not found or unauthorized.

### Update Boss Quest
- **Method**: `PATCH`
- **Path**: `/boss-quests/:bossId`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Updates title, description, or deadline of an active Boss Quest. Rejected if Boss is already completed.
- **Response (200 OK)**: Updated `BossQuestWithDetails`.
- **Response (400 Bad Request)**: Cannot modify a completed Boss Quest.

### Delete Boss Quest
- **Method**: `DELETE`
- **Path**: `/boss-quests/:bossId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Deletes a Boss Quest and cascades deletion to its objectives and quest links.
- **Response (200 OK)**: `{ "success": true, "message": "Boss Quest deleted" }`.

### Add Objective
- **Method**: `POST`
- **Path**: `/boss-quests/:bossId/objectives`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Comprehensive Testing",
    "description": "Integration and unit tests",
    "requiredProgress": 2
  }
  ```
- **Response (201 Created)**: Created `BossObjective`.

### Link Quest to Objective
- **Method**: `POST`
- **Path**: `/boss-quests/:bossId/link-quest`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "questId": "quest-123",
    "objectiveId": "bobj-456"
  }
  ```
- **Response (201 Created)**: `{ "success": true, "link": BossObjectiveQuest }`.
- **Response (409 Conflict)**: Quest is already linked to this objective.

### Unlink Quest from Objective
- **Method**: `DELETE`
- **Path**: `/boss-quests/:bossId/link-quest`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "questId": "quest-123",
    "objectiveId": "bobj-456"
  }
  ```
- **Response (200 OK)**: `{ "success": true, "message": "Quest unlinked successfully" }`.

---

## Phase 7: Shop & Economy API Endpoints

### List Shop Catalog
- **Method**: `GET`
- **Path**: `/shop`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `category`: Optional filter (`AVATAR`, `THEME`, `BADGE`, `COSMETIC`)
  - `search`: Optional search query
- **Description**: Returns all active catalog items annotated with caller's ownership (`isOwned: boolean`, `purchasedAt?: string`).
- **Response (200 OK)**: `ShopItemWithOwnership[]`.

### Get Single Shop Item
- **Method**: `GET`
- **Path**: `/shop/:itemId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves single item metadata and caller's ownership status.
- **Response (200 OK)**: `ShopItemWithOwnership`.
- **Response (404 Not Found)**: Item not found or inactive.

### Purchase Shop Item
- **Method**: `POST`
- **Path**: `/shop/:itemId/purchase`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Atomically purchases a shop item. Row-locks caller character to prevent concurrent race conditions (double spending). Validates item availability, enforces duplicate purchase rejection, deducts gold, and inserts a `SPEND` ledger entry into `economy_transactions`.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "purchase": {
      "id": "purch-uuid",
      "characterId": "char-123",
      "userId": "user-456",
      "itemId": "item-uuid",
      "pricePaid": 75,
      "purchasedAt": "2026-09-12T10:15:00.000Z"
    },
    "remainingGold": 25,
    "item": { ... }
  }
  ```
- **Response (400 Bad Request)**: Insufficient gold balance (`{ "error": "Insufficient gold", "required": 75, "available": 25 }`).
- **Response (404 Not Found)**: Item not found or inactive.
- **Response (409 Conflict)**: Item already owned (`{ "error": "Item already owned" }`).

### Get Economy Transaction Ledger
- **Method**: `GET`
- **Path**: `/economy/transactions`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns caller's immutable audit history of all `EARN` and `SPEND` currency transactions, sorted by newest first.
- **Response (200 OK)**: `EconomyTransaction[]`.

### Get Rewards Summary
- **Method**: `GET`
- **Path**: `/rewards`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Aggregates available gold, lifetime earned gold, lifetime spent gold, owned items count, and recent transactions.
- **Response (200 OK)**: `RewardsSummary`.

---

## Phase 8: Inventory & Equipment API Endpoints

### List Inventory Items
- **Method**: `GET`
- **Path**: `/inventory`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `category`: Optional filter (`ALL`, `AVATAR`, `THEME`, `BADGE`, `COSMETIC`)
  - `search`: Optional search query string
  - `sortBy`: Optional sort order (`RECENT`, `NAME`, `CATEGORY`)
- **Description**: Returns all items owned by the caller's character, annotated with active equipment status (`isEquipped: boolean`, `equippedSlot?: EquipmentSlot`).
- **Response (200 OK)**: `InventoryItem[]`.

### Get Single Inventory Item
- **Method**: `GET`
- **Path**: `/inventory/:itemId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves single owned inventory item with its current equipment state.
- **Response (200 OK)**: `InventoryItem`.
- **Response (404 Not Found)**: Item not found in caller's inventory.

### Equip Item
- **Method**: `POST`
- **Path**: `/inventory/:itemId/equip`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Equips an owned item into its matching category slot (`AVATAR`, `THEME`, `BADGE`, or `COSMETIC`). Enforces server-authoritative ownership check. Atomically replaces any item currently equipped in the target slot without deleting the previous item from inventory.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "equipped": {
      "itemId": "item-uuid",
      "slot": "AVATAR",
      "name": "Cyber Samurai"
    },
    "replacedItemId": "previous-item-uuid"
  }
  ```
- **Response (400 Bad Request)**: Item not owned by character.
- **Response (404 Not Found)**: Item does not exist or is inactive.

### Unequip Item
- **Method**: `POST`
- **Path**: `/inventory/:itemId/unequip`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Unequips an equipped item, clearing its slot assignment. The item remains safely in the user's inventory.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "unequipped": {
      "itemId": "item-uuid",
      "slot": "AVATAR",
      "name": "Cyber Samurai"
    }
  }
  ```
- **Response (400 Bad Request)**: Item is not currently equipped in its slot.

### Get Character Equipment Loadout
- **Method**: `GET`
- **Path**: `/character/equipment`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns a map of the character's currently equipped items across all 4 slots.
- **Response (200 OK)**:
  ```json
  {
    "AVATAR": { "id": "uuid", "name": "Cyber Samurai" },
    "THEME": { "id": "uuid", "name": "Obsidian & Gold" },
    "BADGE": { "id": "uuid", "name": "Master Strategist" },
    "COSMETIC": { "id": "uuid", "name": "Aura of Focus" }
  }
  ```

---

## Phase 9: Achievements & Milestones Endpoints

### List Achievements with Progress
- **Method**: `GET`
- **Path**: `/achievements`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `status`: `'ALL' | 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED'` (default: `'ALL'`)
  - `category`: `'QUESTS' | 'STREAKS' | 'QUEST_CHAINS' | 'BOSS_QUESTS' | 'PROGRESSION' | 'SKILLS' | 'ECONOMY' | 'INVENTORY'`
  - `search`: string (matches title, description, or category)
  - `sortBy`: `'RECENT' | 'PROGRESS' | 'NAME'` (default: `'RECENT'`)
- **Description**: Evaluates character progress deterministically and returns the list of achievements with computed progress percentages and unlock timestamps.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "90000000-0000-4000-8000-000000000001",
      "key": "FIRST_QUEST",
      "name": "First Step Forward",
      "description": "Complete your first real-life quest.",
      "category": "QUESTS",
      "icon": "CheckCircle2",
      "requirementType": "QUEST_COUNT",
      "target": 1,
      "isActive": true,
      "createdAt": "2026-09-12T00:00:00.000Z",
      "progress": 1,
      "isUnlocked": true,
      "unlockedAt": "2026-09-12T17:27:35.000Z",
      "progressPercent": 100
    }
  ]
  ```

### Get Achievement Detail
- **Method**: `GET`
- **Path**: `/achievements/:achievementId`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves single achievement with computed user progress by UUID or key.
- **Response (200 OK)**:
  ```json
  {
    "id": "90000000-0000-4000-8000-000000000001",
    "key": "FIRST_QUEST",
    "name": "First Step Forward",
    "description": "Complete your first real-life quest.",
    "category": "QUESTS",
    "icon": "CheckCircle2",
    "requirementType": "QUEST_COUNT",
    "target": 1,
    "isActive": true,
    "createdAt": "2026-09-12T00:00:00.000Z",
    "progress": 1,
    "isUnlocked": true,
    "unlockedAt": "2026-09-12T17:27:35.000Z",
    "progressPercent": 100
  }
  ```
- **Response (404 Not Found)**: If achievement does not exist.

### Get Achievements Summary
- **Method**: `GET`
- **Path**: `/achievements/summary`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns high-level milestone completion statistics for dashboard widgets and badge headers.
- **Response (200 OK)**:
  ```json
  {
    "total": 14,
    "unlockedCount": 3,
    "inProgressCount": 4,
    "lockedCount": 7,
    "completionPercent": 21
  }
  ```



