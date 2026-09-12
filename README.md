# LIFE RPG

A full-stack web application that transforms real-life productivity into an RPG-style progression experience.

## Project Status
**Phase 2 — Authentication & Character Creation Complete**

## Architecture

The system follows a modular full-stack architecture:

```
Frontend (Next.js 15 App Router)
    ↓
Backend API (Fastify + Zod)
    ↓
Database & Auth (Supabase PostgreSQL + RLS)
```

Shared TypeScript contracts are maintained under `src/shared/` to provide end-to-end type safety between frontend and backend without duplicating models.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Hook Form, Zod
- **Backend**: Fastify, Node.js, TypeScript, Zod
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
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
# Landing page: http://localhost:3000/
# Login: http://localhost:3000/login
# Signup: http://localhost:3000/signup
# Character Creation: http://localhost:3000/character-creation
# Dashboard: http://localhost:3000/dashboard
```

### Running Tests & Quality Checks
```bash
# Run backend unit and integration tests
npm run test

# Run linter across all workspaces
npm run lint

# Compile and build all workspaces
npm run build
```
