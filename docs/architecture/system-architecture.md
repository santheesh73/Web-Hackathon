# System Architecture

## Overview
LIFE RPG follows a decoupled full-stack architecture:

```
Frontend (Next.js 15)  <--->  Shared Contracts (src/shared)  <--->  Backend (Fastify)
         ↓                                                                  ↓
Supabase Auth                                                    Supabase PostgreSQL
```

## Phase 2 Onboarding & Auth Architecture

```
New User Flow:
Landing (/) -> Signup (/signup) -> Character Creation (/character-creation) -> Dashboard (/dashboard)

Existing User Flow:
Landing (/) -> Login (/login) -> Dashboard (/dashboard)
```

## Core Architectural Principles
1. **Authoritative Backend & Database**:
   - Authentication is verified by Supabase Auth with JWT session management.
   - Character ownership is strictly enforced via database Row Level Security (`auth.uid() = user_id`) and `UNIQUE(user_id)`.
   - Passwords are never stored manually or exposed to PostgreSQL.
2. **Shared TypeScript Contracts**:
   - Data transfer schemas and interfaces live in `src/shared/` and are consumed by both frontend forms and backend validation.
3. **Decoupled Frontend Presentation**:
   - Focused onboarding layouts (`(auth)/layout.tsx`) separate from the persistent gameplay shell (`(game)/layout.tsx`).
