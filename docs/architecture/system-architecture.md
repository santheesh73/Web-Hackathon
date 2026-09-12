# System Architecture

## Overview
LIFE RPG follows a decoupled full-stack architecture:

```
Frontend (Next.js 15)  <--->  Shared Contracts (src/shared)  <--->  Backend (Fastify)
         ↓                                                                  ↓
Supabase Auth                                                    Supabase PostgreSQL
```

## User Flows

### Onboarding & Authentication
```
New User Flow:
Landing (/) -> Signup (/signup) -> Character Creation (/character-creation) -> Dashboard (/dashboard)

Existing User Flow:
Landing (/) -> Login (/login) -> Dashboard (/dashboard)
```

### Phase 4 Gameplay Loop
```
Dashboard (/dashboard)
       │
       ├─► Consistency Engine (StreakCard & StreakCalendar)
       │         │
       │         └─► Server-controlled Streak Recovery Shield (/streak/recover)
       │
       ├─► Quest Chains (/quests/chains)
       │         │
       │         ├─► Chain Creation (/quests/chains/create)
       │         │         └─► Step 1 = AVAILABLE, Steps 2..N = LOCKED
       │         │
       │         └─► Chain Roadmap Details (/quests/chains/:chainId)
       │
       └─► Atomic Multi-System Quest Completion (/quest-completion)
                 │
                 ├─► Asserts status is ACTIVE
                 ├─► Asserts attached chain step is AVAILABLE (rejects LOCKED)
                 ├─► Conquers quest & credits server-authoritative XP
                 ├─► Calculates deterministic character level
                 ├─► Records daily activity for UTC calendar day
                 ├─► Updates consecutive active day streak
                 └─► Unlocks step N+1 in chain (or completes chain)
```

## Core Architectural Invariants
1. **Deterministic Calendar Day & Timezone Strategy**:
   - Streaks are strictly anchored to **UTC calendar dates (`YYYY-MM-DD`)**.
   - Eliminates client clock manipulation, daylight saving transitions, and midnight rollover discrepancies.
   - A calendar day counts as active when at least one qualifying quest has its completion on that UTC date. Multiple completions on the same day count as 1 active day.
2. **Sequential Quest Chain Locking**:
   - In a chain of $N$ steps, only the current step is `AVAILABLE`. Future steps remain `LOCKED`.
   - Completing Step $K$ unlocks Step $K+1$.
   - Directly attempting to complete a locked step via API is rejected by both the database and backend with `400 Bad Request`.
3. **Limited Server-Authoritative Streak Recovery**:
   - Eligible only when exactly 1 day was missed (`last_activity_date === yesterday - 1 day`).
   - Each user is granted a single recovery shield that cannot be spammed or reused.
   - The server verifies eligibility and injects a recovery activity record.
4. **Atomic Multi-System Completion**:
   - All state updates (quest, character XP/level, daily activity, streak, chain step advancement) occur within a single atomic database procedure (`complete_quest`) or Fastify route handler.
   - Duplicate completion is strictly prevented and rejected with `409 Conflict`.
