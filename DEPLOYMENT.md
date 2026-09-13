# LIFE RPG — Production Deployment Guide

This guide provides instructions to deploy the complete **LIFE RPG** stack to production.

---

## Architecture Overview

| Component | Technology | Recommended Host | Production Commands |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router, Tailwind, Framer Motion) | **Vercel** or **Render** | Build: `npm run build:frontend`<br>Start: `npm run start:frontend` |
| **Backend** | Fastify 5 (Node.js, TypeScript, Zod) | **Render**, **Railway**, or **Fly.io** | Build: `npm run build:backend`<br>Start: `npm run start:backend` |
| **Database** | PostgreSQL + Auth | **Supabase** | Managed cloud database with SQL migrations |

---

## Step 1: Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Apply the 8 migrations located in [`supabase/migrations/`](file:///d:/Projects/Web%20hack/supabase/migrations/) in numerical order:
   - `20260912000001_create_characters.sql`
   - `20260912000002_create_quests_and_progression.sql`
   - `20260912000003_create_streaks_and_chains.sql`
   - `20260912000004_create_attributes_skills_evolution.sql`
   - `20260912000005_create_boss_quests.sql`
   - `20260912000006_create_economy_and_shop.sql`
   - `20260912000007_create_inventory_and_equipment.sql`
   - `20260912000008_create_achievements.sql`
4. Copy your project credentials from **Project Settings → API**:
   - `Project URL`
   - `anon public key`
   - `service_role secret key` (keep private)
   - Connection string URI from **Database Settings**

---

## Step 2: Backend API Deployment (Render / Railway)

### Option A: Render (Fastest via Blueprint)
1. Push your repository to GitHub.
2. In Render, select **New + → Blueprint** and link your repository.
3. Render reads [`render.yaml`](file:///d:/Projects/Web%20hack/render.yaml) and automatically configures both backend and frontend.
4. Input your `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` values when prompted.

### Option B: Manual Web Service (Render or Railway)
- **Root Directory**: `.` (or project root)
- **Build Command**: `npm install && npm run build:backend`
- **Start Command**: `npm run start:backend`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=4000
  HOST=0.0.0.0
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
  DATABASE_URL=postgresql://...
  FRONTEND_URL=https://your-frontend-domain.vercel.app
  CORS_ORIGIN=https://your-frontend-domain.vercel.app
  API_URL=https://your-backend-domain.onrender.com
  ```
- **Health Check Path**: `/health`

---

## Step 3: Frontend Deployment (Vercel)

1. In [vercel.com](https://vercel.com), click **Add New → Project** and import your GitHub repository.
2. Configure settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (leave as root, [`vercel.json`](file:///d:/Projects/Web%20hack/vercel.json) handles building) OR set to `frontend`
   - **Build Command**: `npm run build:frontend` (or default `npm run build` if root dir is `frontend`)
3. Add Environment Variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
4. Click **Deploy**.

---

## Step 4: Verification Checklist

Once deployed:

1. **Backend Health Check**:
   Visit `https://your-backend-url/health` — should return HTTP 200:
   ```json
   {
     "status": "ok",
     "service": "life-rpg-api"
   }
   ```
2. **Frontend Connectivity**:
   - Open your deployed frontend web app.
   - Test theme toggle (Light, Dark, Orange) in the topbar and marketing page.
   - Sign up or log in.
   - Create and complete a quest to verify backend XP awards and Supabase mutations.
3. **CORS Verification**:
   - Open Browser Developer Tools → Network tab. Verify that API calls to `/health`, `/character`, `/quests` succeed without CORS errors.
