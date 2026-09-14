# NOVA — Streetwear E-Commerce Platform

A mini e-commerce platform built for the Full Stack Engineer take-home assessment: browse a 15-product streetwear catalog with color/size variants, manage a cart and wishlist, and complete a mocked checkout — end to end, fully responsive.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB), JWT auth, zod validation, Jest + Supertest
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Router, Vitest + Testing Library

## Prerequisites

- Node.js 20+ (built with v24)
- A running local MongoDB instance on `mongodb://127.0.0.1:27017` (or update `MONGODB_URI`)

## Setup

```bash
# 1. Install all workspace dependencies (root, server, client)
npm install

# 2. Configure the backend
cp server/.env.example server/.env
# edit server/.env and set a real JWT_SECRET

# 3. Seed the database (creates the 15 products + copies product images into
#    client/public/products/, and creates a demo user)
npm run seed

# 4. Run both apps
npm run dev
```

- Backend: http://localhost:4000 (`GET /api/health` for a liveness check)
- Frontend: http://localhost:5173

**Demo login:** `demo@example.com` / `Passw0rd!` (also shown on the login screen)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs backend + frontend together |
| `npm run seed` | Re-seeds the database and copies product images |
| `npm run test` | Runs backend (Jest) and frontend (Vitest) test suites |
| `npm run build` | Type-checks and builds both workspaces |

## Project Structure

```
server/   Express + TypeScript API (models, services, controllers, routes)
client/   React + TypeScript SPA (pages, components, hooks, api clients)
media/    Source product photography (copied into client/public/products by the seed script)
docs/     Architecture reference notes (see below)
```

See [`docs/superpowers/plans/2026-09-14-ecommerce-platform.md`](docs/superpowers/plans/2026-09-14-ecommerce-platform.md) for the full implementation plan, data model, and API contract.

## Documentation

- [`docs/NOTES_DATABASE.md`](docs/NOTES_DATABASE.md), [`docs/NOTES_BACKEND.md`](docs/NOTES_BACKEND.md), [`docs/NOTES_FRONTEND.md`](docs/NOTES_FRONTEND.md) — reference bullet notes on the architecture, written as source material for the submission's required rationale documents.
- [`docs/AI_USAGE_DRAFT.md`](docs/AI_USAGE_DRAFT.md) — factual draft log of AI tool usage during this build.

**Both sets of documents are explicitly reference material, not the assessment submission itself** — the assessment requires the architecture-rationale docs and the AI-usage disclosure to be written manually, in the candidate's own words. See the header of each file.

## Design Decisions Worth Knowing

- **Variant stock model:** each variant axis (e.g. Color, Size) tracks stock independently per option; available stock for a selection is the minimum across the selected options rather than a full per-combination matrix. Simple, explainable, appropriate at this scale — see `NOTES_DATABASE.md`.
- **Cart & wishlist live on the User document** (embedded), not as separate collections — see `NOTES_DATABASE.md` for the tradeoff.
- **Auth token storage:** JWT Bearer token in `localStorage` via a persisted Zustand store, not an httpOnly cookie — a known XSS-surface tradeoff accepted for this scope, documented in `NOTES_BACKEND.md`.
- **Product browsing is public**; cart, wishlist, and checkout require login.
- Repo is a single npm-workspaces monorepo (`server/` + `client/`) rather than split repos — appropriate for this project's scale (one small API, one small SPA, shared review context).
