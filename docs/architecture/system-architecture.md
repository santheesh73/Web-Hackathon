# System Architecture

## Overview
LIFE RPG follows a decoupled full-stack architecture:

```
Frontend (Next.js)  <--->  Shared Contracts (src/shared)  <--->  Backend (Fastify)
                                                                       ↓
                                                             Database (Supabase)
```

## Principles
1. **Authoritative Backend**: All XP, level progressions, streaks, reward calculations, and quest completions are verified and calculated on the server.
2. **Shared Types & Validation**: API contracts and data transfer objects are defined once in `src/shared/` using TypeScript and Zod.
3. **Thin Frontend**: The client handles rendering, optimistic UI updates, and presentation logic without owning authoritative business rules.
