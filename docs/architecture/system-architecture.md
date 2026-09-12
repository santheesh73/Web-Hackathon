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

### Phase 5 Character Progression & Skill Loop
```
Dashboard (/dashboard)
       │
       ├─► Character Sheet & Disciplines (/character)
       │         │
       │         ├─► Polygonal 6-Axis Attribute Balance Radar
       │         ├─► 6 Dedicated Lifestyle Discipline Cards (STR, INT, DIS, WIS, CRT, RES)
       │         └─► Ascension Path & Requirements Tracker (Tiers 1–4)
       │
       ├─► Branching Skill Tree (/skill-tree)
       │         │
       │         ├─► 18 Unlockable Skill Nodes across 6 Branches
       │         ├─► Server-Authoritative Attunement (/skill-tree/unlock)
       │         └─► Skill Point (SP) Management & Prerequisite Validation
       │
       └─► Atomic Multi-System Quest Completion (/quest-completion)
                 │
                 ├─► Conquers quest & credits server-authoritative XP
                 ├─► Calculates deterministic character level (+1 SP on level-up)
                 ├─► Maps quest category to attribute key & awards Attribute XP
                 ├─► Calculates deterministic attribute level (+1 SP on attribute level-up)
                 ├─► Evaluates Character Evolution Tier (1 to 4) & updates title
                 ├─► Records daily activity & advances streaks
                 └─► Unlocks step N+1 in chain (or completes chain)
```

## Core Architectural Invariants
1. **Deterministic Calendar Day & Timezone Strategy**:
   - Streaks are strictly anchored to **UTC calendar dates (`YYYY-MM-DD`)**.
   - Eliminates client clock manipulation, daylight saving transitions, and midnight rollover discrepancies.
   - Multiple completions on the same calendar day count as 1 active day without inflating streaks.
2. **Sequential Quest Chain Locking**:
   - In a chain of $N$ steps, only the current step is `AVAILABLE`. Future steps remain `LOCKED`.
   - Completing Step $K$ unlocks Step $K+1$.
   - Directly attempting to complete a locked step via API is rejected by both the database and backend with `400 Bad Request`.
3. **Limited Server-Authoritative Streak Recovery**:
   - Eligible only when exactly 1 day was missed (`last_activity_date === yesterday - 1 day`).
   - Each user is granted a single recovery shield that cannot be spammed or reused.
4. **Authoritative Skill Tree Attunement**:
   - All skill unlocks are validated server-side.
   - Requires available unspent skill points $\ge$ node cost, matching attribute level $\ge$ prerequisite, and parent node unlocked.
5. **Non-Destructive Character Evolution**:
   - Character evolution ascensions upgrade titles, cosmetic visual aura frames, and passive perks.
   - Evolution never resets or penalizes player level, attributes, or unspent points.
6. **Unified Atomic Multi-System Completion**:
   - All state updates (quest, character XP/level, attributes XP/level, skill points, evolution tier, streak, chain step advancement) occur within a single atomic database procedure (`complete_quest`) or Fastify route handler.
   - Duplicate completion is strictly prevented and rejected with `409 Conflict`.
