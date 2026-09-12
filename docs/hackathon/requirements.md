# Hackathon Requirements

## Core Architecture
- **Frontend**: Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS, Framer Motion)
- **Backend**: Fastify (Node.js 24, TypeScript, Zod)
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & RPC Stored Procedures
- **Shared Contracts**: Single source of truth under `src/shared/` for types and Zod schemas

## Phase Roadmap Status
- [x] **Phase 0 — Foundation**: Repository structure, workspaces, Fastify health endpoint, and testing skeleton.
- [x] **Phase 1 — Design System & Shell**: Light-first UI tokens, UI primitives, persistent application shell, and landing page.
- [x] **Phase 2 — Authentication & Character Creation**: Supabase Auth, login/signup forms, multi-step character wizard, duplicate prevention, and character database migration.
- [x] **Phase 3 — Quests, Completion & Basic XP Progression**: Quest creation with live XP preview, server-authoritative XP assignment (Easy 25, Medium 50, Hard 100), quest board with filtering (All, Active, Completed), quest details page, atomic idempotent completion RPC (`complete_quest`), deterministic level engine, level-up celebration modal, and dashboard live metrics.
- [ ] **Phase 4 — Streaks & Multipliers**: Daily consistency streaks, combo multipliers, and streak freeze protections.
- [ ] **Phase 5 — Skill Tree & Boss Quests**: Branching capability trees and milestone boss challenges.
- [ ] **Phase 6 — Economy & Rewards**: Shop, inventory, and unlockable rewards.
