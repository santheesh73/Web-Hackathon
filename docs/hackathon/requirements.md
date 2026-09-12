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
- [x] **Phase 4 — Streaks, Calendar, Recovery & Quest Chains**: Daily consistency streaks, UTC deterministic calendar heatmap (28-day history), single-use server-controlled streak recovery shield, multi-step quest chains with sequential locking and unlocking, and atomic quest completion integrating XP, streaks, and chain progression.
- [x] **Phase 5 — Character Progression Layer (Attributes, Skill Tree & Evolution)**: 6 core lifestyle attributes, deterministic attribute level curve, skill points rewards on attribute and character level-up, 18-node branching skill tree with prerequisite validation, 4-tier character ascension evolution system with archetype titles, and atomic quest completion integration.
- [x] **Phase 6 — Boss Quests & Major Milestone Battles**: Multi-objective major goal tracking, fixed challenge difficulties (`Rare`, `Epic`, `Legendary`), RPG Boss HP gauge visualization, quest linking to milestones, and atomic completion transaction integrating normal XP, attributes, streaks, chains, and Boss defeat bounties (+250, +500, +1000 XP).
- [ ] **Phase 7 — Economy & Rewards**: Shop, inventory, and unlockable rewards.
