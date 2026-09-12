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
