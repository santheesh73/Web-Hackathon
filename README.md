# LIFE RPG

> **"What if your real life had an RPG progression system?"**
>
> A production-quality, server-authoritative web application that transforms real-life tasks, daily habits, and ambitious goals into an epic RPG adventure.

[![Test Suite](https://img.shields.io/badge/Vitest-129%20Passing-brightgreen)](https://github.com/santheesh73/Web-Hackathon)
[![ESLint](https://img.shields.io/badge/ESLint-0%20Warnings-success)](https://github.com/santheesh73/Web-Hackathon)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.25-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Fastify](https://img.shields.io/badge/Fastify-v5.0-green)](https://www.fastify.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20RLS-3ecf8e)](https://supabase.com)

---

## Table of Contents
- [Problem & Solution](#problem--solution)
- [Core Progression Loop](#core-progression-loop)
- [Feature Matrix](#feature-matrix)
- [Architecture & Invariants](#architecture--invariants)
- [Tech Stack](#tech-stack)
- [Quickstart & Run Instructions](#quickstart--run-instructions)
- [Judge Evaluation & Demo Walkthrough](#judge-evaluation--demo-walkthrough)
- [Testing & Quality Verification](#testing--quality-verification)
- [Hackathon Disclosures](#hackathon-disclosures)
- [License & Credits](#license--credits)

---

## Problem & Solution

### The Problem
Traditional productivity tools and to-do lists feel mundane, clinical, and punitive. When users complete chores or workouts, there is no tangible sense of momentum, growth, or compounding achievement. Conversely, gamified apps often rely on superficial points, intrusive ads, or complex multiplayer dynamics that distract from actual life progress.

### The Solution
**LIFE RPG** bridges real-world productivity with authentic RPG game design:
- **Real Deeds, Real XP**: Conquering real tasks directly increases your character's Level, Disciplines, and Gold balance.
- **Server-Authoritative Fairness**: Mathematical progression curves, streak validations, and economy transactions are validated server-side.
- **Intrinsic Compounding**: No arbitrary paywalls, gambling, or loot boxes. Every reward is earned through tangible daily consistency.

---

## Core Progression Loop

```
REAL-LIFE ACTION
       │
       ▼
Conquer Quest (/quests)
       │
       ├─► Server-Authoritative XP Awarded (+25 to +100 XP)
       ├─► Deterministic Level Calculation & Skill Points (+1 SP)
       ├─► Category Mapped to 6 Life Disciplines (STR, INT, DIS, WIS, CRT, RES)
       ├─► Daily Streak Incremented (UTC calendar day anchor)
       ├─► Sequential Quest Chain Step Unlocked (Step N+1)
       ├─► Active Boss Objectives Advanced & Defeat Bounty Checked
       ├─► Gold Awarded to Economy Balance
       │
       ▼
Reward Marketplace (/shop)
       │
       ├─► Acquire Cosmetic Relics, Avatars, Themes & Badges
       │
       ▼
Inventory & Equipment (/inventory)
       │
       ├─► Configure 4 Cosmetic Equipment Slots (AVATAR, THEME, BADGE, COSMETIC)
       │
       ▼
Character Sheet (/character)
       │
       ├─► Polygonal 6-Axis Radar & Evolution Ascension Path
       │
       ▼
Achievements & Chronicle (/achievements & /history)
       │
       └─► Permanent Recognition Milestones & Activity Timeline Logged
```

---

## Feature Matrix

| System | Description | Status |
|---|---|:---:|
| **Authentication** | Secure email/password login & registration with Supabase Auth or local demo mode. | Live |
| **Character Creation** | 6 Archetypes, Life Focus selection, and persistent character identity. | Live |
| **Quests & Tasks** | Difficulty tiers (Easy, Medium, Hard), 6 life categories, deadlines, and XP rewards. | Live |
| **Daily Streaks** | UTC calendar day tracking, 28-day history heat-map, and single-use recovery shield. | Live |
| **Quest Chains** | Sequential step locking ($N+1$ requires step $N$), roadmaps, and completion bonuses. | Live |
| **Attributes & Radar** | 6 lifestyle disciplines plotted on a responsive polygonal SVG radar chart. | Live |
| **Skill Tree** | 18 unlockable skill nodes across 6 branches with prerequisite validation. | Live |
| **Character Evolution** | 4 ascension tiers based on overall attribute balance and mastery. | Live |
| **Boss Quests** | Monumental goals broken into multi-stage battle objectives with XP bounties. | Live |
| **Gold Economy** | Server-authoritative ledger tracking earnings, expenditures, and balances. | Live |
| **Reward Marketplace** | Shop catalog featuring custom avatars, themes, badges, and cosmetic flair. | Live |
| **Inventory & Equipment** | Non-combat cosmetic loadout with 1-item-per-slot replacement and unequip safety. | Live |
| **Achievements** | 14 seed milestones with deterministic requirement evaluation and popups. | Live |
| **Activity Chronicle** | Filterable chronological history timeline aggregating all player deeds. | Live |

---

## Architecture & Invariants

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                     │
│   App Router • React 19 • Tailwind CSS • Framer Motion UI    │
└──────────────────────────────┬───────────────────────────────┘
                               │
            Shared Contracts   │  REST API / JSON
            (`src/shared`)     │  Type-Safe Zod Schemas
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                    Backend API (Fastify)                     │
│    Modular Route Controllers • Progression Evaluation Engines│
└──────────────────────────────┬───────────────────────────────┘
                               │
                               │  PostgreSQL Connection Pool
                               │  Atomic SQL Stored Procedures
┌──────────────────────────────▼───────────────────────────────┐
│                 Database (Supabase PostgreSQL)               │
│   Row Level Security (RLS) • Constraints • Relational Schema │
└──────────────────────────────────────────────────────────────┘
```

### Architectural Guarantees
1. **Single Source of Truth**: All domain models, Zod validation schemas, API constants, and progression formulas are defined once in `src/shared/`.
2. **Server-Authoritative Logic**: Clients cannot falsify XP, Gold, streak records, or inventory ownership.
3. **UTC Calendar Consistency**: Streak logic is strictly keyed to UTC calendar dates (`YYYY-MM-DD`), preventing timezone and clock manipulation bugs.
4. **Zero Pay-to-Win**: No real-money transactions, microtransactions, or gambling mechanics. All gameplay items are strictly cosmetic.
5. **Multi-User Isolation**: Supabase Row Level Security (RLS) policies and backend tenant filters ensure complete data boundary isolation between users.

---

## Tech Stack

- **Frontend Framework**: Next.js 15.5.25 (App Router, Server & Client Components)
- **UI & Motion**: Tailwind CSS, Framer Motion, Lucide React Icons
- **Forms & Validation**: React Hook Form, `@hookform/resolvers`, Zod
- **Backend API**: Fastify v5, `@fastify/cors`, Node.js 20+
- **Database & Auth**: Supabase PostgreSQL 15, Row Level Security (RLS), Stored Procedures
- **Shared Layer**: TypeScript 5, Zod Schemas (`src/shared`)
- **Testing**: Vitest (23 test suites, 129 automated tests)

---

## Quickstart & Run Instructions

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/santheesh73/Web-Hackathon.git
cd Web-Hackathon
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Note: LIFE RPG includes an automatic offline demo mode. If Supabase keys are not set, the app seamlessly runs using the local development engine).*

### 3. Launch Development Servers
Run both frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`
- **Backend Health**: `http://localhost:4000/health`

Alternatively, run in separate terminals:
```bash
npm run dev:backend   # Fastify server on port 4000
npm run dev:frontend  # Next.js app on port 3000
```

---

## Judge Evaluation & Demo Walkthrough

To experience the complete product journey without manual account setup, use our built-in **Judge Fast-Pass**:

1. Open `http://localhost:3000`.
2. Review the **Landing Page** highlighting the 9 progression pillars.
3. Click **"Sign In"** in the top navigation.
4. Click **"One-Click Quick Demo Sign In"** on the login card.
5. You are immediately launched into the **Hero Dashboard** (`/dashboard`):
   - Inspect Level 3 Adventurer, XP bar, and Gold balance.
   - Note the **"Suggested Action"** prompt answering *"What should I do next?"*.
6. Navigate to **Quests** (`/quests`):
   - Click the checkmark on an active quest to conquer it.
   - Observe immediate XP feedback, Gold reward, and streak increment without page reload.
7. Navigate to **Quest Chains** (`/quests/chains`):
   - View sequential roadmaps with Step 1 completed, Step 2 available, and Step 3 locked.
8. Navigate to **Boss Quests** (`/boss-quests`):
   - Inspect *"The Sloth Leviathan"* with linked quest battle objectives.
9. Navigate to **Character** (`/character`):
   - Explore the interactive 6-axis attribute polygon radar and Ascension Path.
10. Navigate to **Skill Tree** (`/skill-tree`):
    - Spend available Skill Points to unlock a specialization node.
11. Navigate to **Shop** (`/shop`):
    - Spend earned Gold on a cosmetic relic or avatar theme.
12. Navigate to **Inventory** (`/inventory`):
    - Equip the purchased item to its corresponding slot and verify automatic slot replacement.
13. Navigate to **Achievements** (`/achievements`):
    - Inspect unlocked badges, real-time progress bars, and filters.
14. Navigate to **History** (`/history`):
    - Scroll through the unified chronological activity timeline of all conquered quests, transactions, and milestones.

---

## Testing & Quality Verification

### 1. Automated Test Suite (Vitest)
```bash
npm run test
```
**Results**:
- **23 test files passed (23/23)**
- **129 tests passed (129/129)**
- Test coverage covers auth, characters, quests, leveling formulas, streaks, quest chains, attributes, skill tree prerequisites, boss objectives, gold ledger, shop validation, inventory equipment replacement, and achievement recognition.

### 2. Linting
```bash
npm run lint
```
**Results**:
- `✔ No ESLint warnings or errors` across frontend and backend workspaces.

### 3. Production Build
```bash
npm run build
```
**Results**:
- Next.js 15 compiles all 20 static and dynamic routes cleanly.
- TypeScript compiler (`tsc`) builds backend type definitions with zero errors.

---

## Hackathon Disclosures

In accordance with Web Hackathon rulebook guidelines on transparency:

### Third-Party Frameworks & Libraries
- **React 19 & Next.js 15**: Core application framework and routing.
- **Fastify v5**: REST API backend server.
- **Tailwind CSS**: Utility styling and design tokens.
- **Framer Motion**: Micro-interactions, celebratory toasts, and modal animations.
- **Lucide React**: Open-source SVG iconography.
- **Zod & React Hook Form**: Strict input validation and form state handling.
- **Vitest**: Test runner and assertion library.
- **Supabase**: PostgreSQL database client and authentication SDK.

### AI Assistance Disclosure
- **Antigravity AI Assistant (Google DeepMind)** was utilized for pair programming, full-stack architecture design, TypeScript type scaffolding, and writing automated test cases. All code has been verified, tested, and vetted by the project engineer.

### UI Templates & Boilerplate
- **Zero Pre-Made Templates**: Every component, card, radar chart, skill tree graph, modal, and layout was designed and coded bespoke for LIFE RPG.

---

## License & Credits

- Developed for the **Web Hackathon**.
- Built by the LIFE RPG development team.
- Distributed under the MIT License.
