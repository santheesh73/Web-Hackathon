# LIFE RPG

A full-stack web application that transforms real-life productivity into an RPG-style progression experience.

## Project Status
Phase 0 — Foundation

## Architecture

The system follows a modular full-stack architecture:

```
Frontend (Next.js App Router)
    ↓
Backend API (Fastify + Zod)
    ↓
Database (Supabase PostgreSQL)
```

Shared TypeScript contracts are maintained under `src/shared/` to provide end-to-end type safety between frontend and backend without duplicating models. Authoritative game logic resides exclusively on the backend.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, ESLint
- **Backend**: Fastify, Node.js, TypeScript, Zod
- **Database**: Supabase PostgreSQL
- **Shared**: TypeScript contracts (`src/shared`)
- **Testing**: Vitest

## Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### Running Locally

#### Run Both Concurrently
```bash
npm run dev
```

#### Run Backend Only
```bash
npm run dev:backend
# Backend server runs at http://localhost:4000
# Health check: http://localhost:4000/health
```

#### Run Frontend Only
```bash
npm run dev:frontend
# Frontend application runs at http://localhost:3000
```

### Running Tests & Quality Checks
```bash
# Run backend tests
npm run test

# Run linter
npm run lint

# Format codebase
npm run format
```
