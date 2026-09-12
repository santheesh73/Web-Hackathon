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

### Phase 3 Quest & Progression Loop
```
Dashboard (/dashboard)
       │
       ├─► Quest Creation (/quests/create)
       │         │
       │         └─► Server assigns authoritative XP (Easy: 25, Medium: 50, Hard: 100)
       │
       ├─► Quest Board (/quests) [Filter: All / Active / Completed]
       │         │
       │         └─► Quest Details (/quests/:questId)
       │                   │
       │                   └─► Atomic Completion (RPC `complete_quest` / `POST /quest-completion`)
       │                             ├─► Assert status is ACTIVE (idempotent / prevents duplicate XP)
       │                             ├─► Mark status COMPLETED
       │                             ├─► Add XP to Character
       │                             ├─► Deterministic Level Engine calculation
       │                             └─► Celebration Modal & LevelUp Modal Trigger
```

## Core Architectural Invariants
1. **Server-Authoritative Progression**:
   - XP rewards are strictly bound to quest difficulty on the backend/database layer.
   - Clients cannot supply arbitrary XP values; any client attempt to specify custom XP is overwritten.
2. **Atomic & Idempotent Completion**:
   - Completed quests cannot be completed twice.
   - In Supabase PostgreSQL, `complete_quest` verifies `status = 'ACTIVE'` within a transaction.
   - In Fastify, `POST /quest-completion` checks `quest.status` and rejects re-completion with `409 Conflict`.
3. **Deterministic Level Engine**:
   - Level thresholds are computed with mathematical purity in both PostgreSQL (`calculate_character_level`) and shared TypeScript (`getLevelFromXp`).
   - Thresholds: Level 1 (0–99), Level 2 (100–249), Level 3 (250–449), Level 4 (450–699), Level 5 (700–999), Level 6+ (+350 XP per tier).
4. **Shared TypeScript Contracts**:
   - Data transfer schemas and interfaces live in `src/shared/` and are consumed across the monorepo.
