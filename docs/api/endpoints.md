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
- **Response (409 Conflict)**: Returned if the user already has an active character:
  ```json
  {
    "error": "Character already exists for this account"
  }
  ```

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
- **Response (200 OK)**:
  ```json
  {
    "id": "quest-1789203015420-vh043",
    "userId": "user-uuid",
    "characterId": "char-uuid",
    "title": "Complete 30-minute cardio session",
    "description": "Morning jog in the park",
    "category": "Health",
    "difficulty": "Medium",
    "xpReward": 50,
    "status": "ACTIVE",
    "dueDate": "2026-09-15T08:00:00.000Z",
    "createdAt": "2026-09-12T00:00:00.000Z",
    "updatedAt": "2026-09-12T00:00:00.000Z"
  }
  ```
- **Response (404 Not Found)**: If quest does not exist or belongs to another user.

### Quest Creation
- **Method**: `POST`
- **Path**: `/quests`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Creates a new real-life quest. XP is authoritatively assigned by the server (Easy: 25, Medium: 50, Hard: 100). Any client-supplied XP is strictly ignored.
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
- **Response (201 Created)**: Returns the newly created `Quest` object with `status: "ACTIVE"` and server-computed `xpReward`.

---

### Quest Completion (Atomic & Idempotent)
- **Method**: `POST`
- **Path**: `/quest-completion`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Description**: Atomically completes a quest, awards XP to character, recalculates level, and prevents duplicate completions.
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
    "leveledUp": true
  }
  ```
- **Response (409 Conflict)**: If the quest was already completed (prevents double XP awarding):
  ```json
  {
    "error": "Quest has already been completed. Duplicate completion rejected."
  }
  ```

---

### Progression Summary
- **Method**: `GET`
- **Path**: `/progression`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Retrieves current XP, deterministic level rank, and percentage progress toward next level.
- **Response (200 OK)**:
  ```json
  {
    "level": 2,
    "xp": 100,
    "progress": {
      "currentLevel": 2,
      "nextLevel": 3,
      "currentLevelBaseXp": 100,
      "nextLevelXp": 250,
      "xpInCurrentLevel": 0,
      "xpNeededForNextLevel": 150,
      "progressPercent": 0
    }
  }
  ```
