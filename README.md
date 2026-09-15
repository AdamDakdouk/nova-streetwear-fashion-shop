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
# edit server/.env: set a real JWT_SECRET; a RESEND_API_KEY (resend.com) for
# OTP emails; MONGODB_URI pointed at a real cluster if not running Mongo
# locally; and the 5 R2_* vars (dash.cloudflare.com) for admin image uploads
# — see notes below, all of these are required at boot

# 3. Seed the database (creates the 15 products + copies product images into
#    client/public/products/, creates a demo user, and inserts the default
#    homepage hero — re-running never overwrites an edited hero)
npm run seed

# 4. Run both apps
npm run dev
```

- Backend: http://localhost:4000 (`GET /api/health` for a liveness check)
- Frontend: http://localhost:5173

**Demo login:** `demo@example.com` / `Passw0rd!` (also shown on the login screen)

**Admin dashboard:** `/admin/login` — `admin@nova.com` / `AdminPass123!` (not linked from the storefront UI; add/edit/delete products including image upload, and edit the homepage hero banner — copy, button label, and 1–4 images, with a live preview). See `NOTES_BACKEND.md` / `NOTES_FRONTEND.md` for how the role gating works.

**Email/OTP:** registration, email verification, and password reset send real email via [Resend](https://resend.com). `EMAIL_FROM` must be an address on a domain verified in Resend — with a verified domain, anyone can register and receive their own verification code. Resend's shared sandbox sender (`onboarding@resend.dev`) needs no DNS setup but only ever delivers to the address the Resend account was registered with, so it works for local testing and not for anyone else. `RESEND_API_KEY` is required at boot (the server won't start without it).

**Admin image uploads:** stored on [Cloudflare R2](https://dash.cloudflare.com) (S3-compatible object storage), not the app's own server — a local-disk approach was tried first and dropped once it was clear it wouldn't survive an actual deploy (see `NOTES_BACKEND.md`). Needs a bucket with public access enabled and an API token; all 5 `R2_*` vars are required at boot.

## Deployment (Vercel)

Deployed as a **single Vercel project** — the React app and the API share one domain, so there is no CORS to configure and no pair of URLs to keep in sync.

| Path | Served by |
|---|---|
| `/` | the built React app (`client/dist`) |
| `/api/*` | the Express app, as one serverless function |

- `vercel.json` sets the build command (`npm run build -w client`), the output directory, the SPA rewrite that stops `/products/:id` 404ing on refresh, and bakes `VITE_API_URL=/api` into the build so it can't be forgotten.
- `api/[...path].ts` is a catch-all function that awaits a database connection and hands the request to the **unchanged** Express app — Express still does all the routing, exactly as it does locally.
- `connectDB` memoises its connection on `globalThis`. A long-running server connects once at boot; a serverless one would otherwise open a fresh pool per request and exhaust the cluster's connection limit.
- Root `tsconfig.json` exists purely so `api/` is type-checked. Vercel bundles that file with esbuild and never type-checks it, which would otherwise leave the deployment's most important file the only one nothing verifies.

**Setting it up:**

1. Import the GitHub repo in Vercel. Leave the root directory as the repo root — `vercel.json` handles the rest.
2. Add the environment variables (Project → Settings → Environment Variables). All of these are required at boot; the API throws a clear "Missing required environment variable" on the first request if any is absent:
   `MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.
   Optional: `JWT_EXPIRES_IN`, `EMAIL_FROM`.
3. In MongoDB Atlas, set Network Access to allow `0.0.0.0/0`. Vercel's outbound IPs are not fixed, so an allowlist of specific addresses will fail intermittently.
4. Deploy, then check `/api/health` returns `{"status":"ok"}` before testing the storefront.

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
