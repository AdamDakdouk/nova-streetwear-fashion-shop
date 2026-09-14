# Streetwear E-Commerce Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Adaptation note:** This is a solo take-home-assessment build (one engineer, one session), not a team handoff. Task granularity is coarser than the skill's default 2-5-minute atomic steps — each task is a cohesive vertical slice (one model, one route group, one page) sized for a single focused implementation pass, with real schemas/contracts locked in below rather than re-derived per micro-step. Full component-level code is written directly in the source files during implementation, not duplicated here.

**Goal:** Build a MERN + TypeScript mini e-commerce platform (login, product listing/detail with variants, cart, wishlist, checkout + confirmation) that is fully responsive, enterprise-grade in structure, and visually restrained/professional — satisfying every requirement in `Full_Stack_Engineer_Assessment.pdf`.

**Architecture:** npm-workspaces monorepo (`server/`, `client/`). Backend: Express + TypeScript + Mongoose (MongoDB, running locally) with JWT auth, layered controller→service→model, centralized error handling, zod input validation. Frontend: React + TypeScript + Vite + Tailwind CSS, React Router, TanStack Query for all server state (products/cart/wishlist/orders), a small Zustand store only for the auth token + UI-only state. Product catalog is seeded from the 15 real product photo sets already in `media/`.

**Tech Stack:** Node 24, Express 4, TypeScript 5, Mongoose 8, MongoDB 8 (local), JWT (`jsonwebtoken`), `bcryptjs`, `zod`; React 18, Vite 5, Tailwind CSS 3, `@tanstack/react-query`, `zustand`, `react-router-dom` 6, `axios`, `vitest` + `@testing-library/react` (frontend), `jest` + `supertest` (backend).

---

## Product Catalog (from `media/`)

15 products, 6 with color variants (satisfies the ">1 variant on ≥3 products" requirement with margin), all apparel/accessories get a Size axis where realistic. Variant axes are independent (Color, Size), each option carries its own stock — no combinatorial per-combo stock matrix (deliberate scope simplification, documented in the DB notes).

| # | Slug | Title | Colors (from files) | Sizes |
|---|------|-------|----------------------|-------|
| 1 | essential-t-shirt | Essential T-Shirt | Blue, Olive Oil | S, M, L, XL |
| 2 | oversized-t-shirt | Oversized T-Shirt | Black, Gray | S, M, L, XL |
| 3 | classic-hoodie | Classic Hoodie | — | S, M, L, XL |
| 4 | zip-hoodie | Zip Hoodie (Pink) | — | S, M, L, XL |
| 5 | denim-jacket | Denim Jacket | Blue, Washed Black | S, M, L |
| 6 | bomber-jacket | Bomber Jacket | Beige, Olive | S, M, L |
| 7 | cargo-pants | Cargo Pants | — | 30, 32, 34, 36 |
| 8 | relaxed-jeans | Relaxed Jeans | — | 30, 32, 34, 36 |
| 9 | sweatpants | Sweatpants | — | S, M, L, XL |
| 10 | classic-sneakers | Classic Sneakers | — | 40, 41, 42, 43, 44 |
| 11 | rapid-move-sneakers | Rapid Move Sneakers | — | 40, 41, 42, 43, 44 |
| 12 | basecap | Basecap | Beige, Black, White | One Size |
| 13 | crossbody-bag | Crossbody Bag | Gray, Reddish | One Size |
| 14 | leather-belt | Leather Belt | — | 30, 32, 34, 36 |
| 15 | sunglasses | Sunglasses | — | One Size |

Images copied from `media/` into `client/public/products/<slug>/` during seeding (Task 3).

---

## File Structure

```
ecommerce-platform/
  package.json                        # workspaces root
  .gitignore
  README.md
  docs/
    NOTES_DATABASE.md                 # bullet reference notes (Task 16) — NOT the submission doc
    NOTES_BACKEND.md
    NOTES_FRONTEND.md
    AI_USAGE_DRAFT.md                 # factual draft — NOT the submission doc
  server/
    package.json / tsconfig.json / jest.config.ts / .env.example
    src/
      index.ts                        # boot: connect DB, listen
      app.ts                          # express app, middleware wiring
      config/env.ts                   # typed env access
      config/db.ts                    # mongoose connect
      models/User.ts
      models/Product.ts
      models/Order.ts
      middleware/auth.ts              # requireAuth
      middleware/errorHandler.ts
      middleware/validate.ts          # zod body/params validator
      middleware/asyncHandler.ts
      utils/ApiError.ts
      utils/jwt.ts
      services/cart.service.ts        # stock resolution, totals, mutations
      services/order.service.ts       # cart -> order, stock decrement
      controllers/auth.controller.ts
      controllers/product.controller.ts
      controllers/cart.controller.ts
      controllers/wishlist.controller.ts
      controllers/order.controller.ts
      routes/auth.routes.ts
      routes/product.routes.ts
      routes/cart.routes.ts
      routes/wishlist.routes.ts
      routes/order.routes.ts
      routes/index.ts
      validators/auth.validators.ts
      validators/cart.validators.ts
      types/express/index.d.ts        # augment Request.user
      seed/products.data.ts           # the 15-product dataset
      seed/seed.ts                    # copies images + upserts DB + prints demo creds
    tests/
      unit/cart.service.test.ts
      unit/order.service.test.ts
      integration/auth.test.ts
      integration/products.test.ts
      integration/cart.test.ts
  client/
    package.json / tsconfig.json / vite.config.ts / tailwind.config.ts / postcss.config.js
    index.html
    public/products/<slug>/*.jpg|png
    src/
      main.tsx
      App.tsx
      router.tsx
      styles/globals.css
      lib/queryClient.ts
      lib/formatCurrency.ts
      api/client.ts                   # axios instance, auth header + 401 interceptor
      api/auth.api.ts
      api/products.api.ts
      api/cart.api.ts
      api/wishlist.api.ts
      api/orders.api.ts
      types/index.ts                  # Product, Variant, CartItem, Order, User
      store/authStore.ts              # zustand + persist: token, user
      hooks/useAuth.ts
      hooks/useProducts.ts
      hooks/useCart.ts
      hooks/useWishlist.ts
      components/layout/Header.tsx
      components/layout/MobileNav.tsx
      components/layout/Footer.tsx
      components/layout/ProtectedRoute.tsx
      components/ui/Button.tsx
      components/ui/Spinner.tsx
      components/ui/EmptyState.tsx
      components/ui/QuantityStepper.tsx
      components/ui/Toast.tsx (or toast lib)
      components/product/ProductCard.tsx
      components/product/ProductGrid.tsx
      components/product/VariantSelector.tsx
      components/cart/CartLineItem.tsx
      components/cart/CartSummary.tsx
      pages/LoginPage.tsx
      pages/ProductListPage.tsx
      pages/ProductDetailPage.tsx
      pages/CartPage.tsx
      pages/WishlistPage.tsx
      pages/CheckoutPage.tsx
      pages/OrderConfirmationPage.tsx
      pages/NotFoundPage.tsx
    tests/
      cartStore.test.tsx (or hook test)
      ProductCard.test.tsx
      VariantSelector.test.tsx
```

---

## Data Models (locked in now — all later tasks depend on these exact shapes)

### `server/src/models/User.ts`

```ts
import { Schema, model, Types, Document } from "mongoose";

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId;
  variantSelection: Record<string, string>; // e.g. { Color: "Blue", Size: "M" }
  quantity: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  wishlist: Types.ObjectId[];
  cart: ICartItem[];
  createdAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantSelection: { type: Schema.Types.Mixed, default: {} },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  cart: [cartItemSchema],
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>("User", userSchema);
```

### `server/src/models/Product.ts`

```ts
import { Schema, model, Document } from "mongoose";

export interface IVariantOption {
  value: string;      // "Blue", "M", "One Size"
  stock: number;
}

export interface IVariantAxis {
  name: string;        // "Color" | "Size"
  options: IVariantOption[];
}

export interface IProduct extends Document {
  slug: string;
  title: string;
  price: number;         // in cents (USD) to avoid float issues
  description: string;
  images: string[];      // ["/products/essential-t-shirt/blue.jpg", ...]
  thumbnail: string;
  variants: IVariantAxis[];
  baseStock: number;     // used when a product has no variants at all
  category: string;
}

const variantOptionSchema = new Schema<IVariantOption>(
  { value: { type: String, required: true }, stock: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const variantAxisSchema = new Schema<IVariantAxis>(
  { name: { type: String, required: true }, options: { type: [variantOptionSchema], required: true } },
  { _id: false }
);

const productSchema = new Schema<IProduct>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  thumbnail: { type: String, required: true },
  variants: { type: [variantAxisSchema], default: [] },
  baseStock: { type: Number, default: 0 },
  category: { type: String, required: true },
});

export const Product = model<IProduct>("Product", productSchema);
```

### `server/src/models/Order.ts`

```ts
import { Schema, model, Types, Document } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  variantSelection: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  placedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variantSelection: { type: Schema.Types.Mixed, default: {} },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true },
  placedAt: { type: Date, default: Date.now },
});

export const Order = model<IOrder>("Order", orderSchema);
```

**Stock resolution rule** (used by `cart.service.ts` and `order.service.ts`): for a product with variant axes, "available stock for a given selection" = `min(option.stock for each axis where the selected value matches)`. If the product has no variants, use `baseStock`. This is a deliberate simplification vs. full per-combination stock — documented in `NOTES_DATABASE.md`.

**Money:** all prices/subtotals/totals are integers in **cents**. `formatCurrency.ts` on the frontend divides by 100 and formats via `Intl.NumberFormat`.

---

## API Contract

All routes prefixed `/api`. Auth routes are public; everything else requires `Authorization: Bearer <token>`.

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{name, email, password}` | `{user, token}` |
| POST | `/auth/login` | `{email, password}` | `{user, token}` |
| GET | `/auth/me` | — | `{user}` |
| GET | `/products` | — | `[{_id, slug, title, price, thumbnail, hasVariants, priceRange}]` |
| GET | `/products/:id` | — | full `IProduct` incl. `images`, `variants` |
| GET | `/cart` | — | `{items: [{...cartItem, product, unitPrice, subtotal, availableStock}], total}` |
| POST | `/cart` | `{productId, variantSelection, quantity}` | updated cart (as above) |
| PATCH | `/cart/:itemId` | `{quantity?, variantSelection?}` | updated cart |
| DELETE | `/cart/:itemId` | — | updated cart |
| GET | `/wishlist` | — | `[IProduct]` |
| POST | `/wishlist` | `{productId}` | updated wishlist |
| DELETE | `/wishlist/:productId` | — | updated wishlist |
| POST | `/orders` | — (uses current cart) | `{order}` — also clears user's cart, decrements stock |
| GET | `/orders/:id` | — | `{order}` |

Errors: `{message, details?}` with proper 4xx/5xx status via `ApiError` + `errorHandler`.

---

## Design System (from ui-ux-pro-max quick-reference, applied to web)

- **Palette:** warm off-white background `#FAFAF8`, ink `#18181B` (primary text), charcoal `#27272A` (surfaces/nav), single accent **rust/terracotta `#C2410C`** for primary CTAs and active states (restrained streetwear boutique feel, not loud), semantic `success #16A34A`, `error #DC2626` — all pairs checked for ≥4.5:1 contrast on their background.
- **Typography:** headings **Sora** (600/700), body/UI **Inter** (400/500) — both via Google Fonts `<link>` with `font-display: swap`. Base 16px, scale `12/14/16/18/24/32/40`. Tabular figures for prices.
- **Spacing:** 4px/8px rhythm (Tailwind default scale already matches).
- **Breakpoints:** Tailwind defaults — `sm 640 / md 768 / lg 1024 / xl 1280`. Mobile-first. No horizontal scroll anywhere; product grid `1 col → 2 (sm) → 3 (lg) → 4 (xl)`.
- **Icons:** `lucide-react` only (no emoji).
- **Components:** one elevation scale (`shadow-sm` cards, `shadow-md` popovers/modals), one radius scale (`rounded-md` inputs/buttons, `rounded-lg` cards), visible focus rings (`focus-visible:ring-2 ring-offset-2 ring-[#C2410C]`), 44px min touch targets, loading buttons disable + spinner, skeleton placeholders for product grid/detail while loading.

---

## Task 1: Monorepo Scaffold

**Files:**
- Create: `package.json` (root, workspaces)
- Create: `.gitignore`
- Create: `server/package.json`, `server/tsconfig.json`, `server/.env.example`
- Create: `client/` via Vite scaffold, then `client/tailwind.config.ts`, `postcss.config.js`

- [ ] Root `package.json`:

```json
{
  "name": "ecommerce-platform",
  "private": true,
  "workspaces": ["server", "client"],
  "scripts": {
    "dev": "concurrently -k -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "seed": "npm run seed -w server",
    "test": "npm run test -w server && npm run test -w client",
    "build": "npm run build -w server && npm run build -w client"
  },
  "devDependencies": { "concurrently": "^8.2.2" }
}
```

- [ ] `.gitignore`: `node_modules/`, `dist/`, `.env`, `*.log`, `.DS_Store`
- [ ] Init `server/`: `npm init -y` in `server/`, install `express mongoose bcryptjs jsonwebtoken cors dotenv zod`, dev deps `typescript ts-node-dev @types/express @types/node @types/cors @types/bcryptjs @types/jsonwebtoken jest ts-jest @types/jest supertest @types/supertest mongodb-memory-server`. `tsconfig.json` target `ES2022`, `module NodeNext`, `strict: true`, `outDir dist`, `rootDir src`.
- [ ] `server/.env.example`:
  ```
  PORT=4000
  MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_platform
  JWT_SECRET=replace-with-a-long-random-string
  JWT_EXPIRES_IN=2h
  CLIENT_ORIGIN=http://localhost:5173
  ```
  Copy to `server/.env` with a real random `JWT_SECRET` (not committed).
- [ ] Scaffold `client/` with Vite React-TS template, install `tailwindcss postcss autoprefixer @tanstack/react-query axios zustand react-router-dom lucide-react`, dev deps `vitest @testing-library/react @testing-library/jest-dom jsdom`. Init Tailwind config with the color tokens from Design System section as `theme.extend.colors`.
- [ ] Run `npm install` at root; verify `npm run dev` boots both (empty apps) without error.
- [ ] Commit: `chore: scaffold monorepo (server + client workspaces)`

## Task 2: Backend Core Wiring (config, app, error handling, server boot)

**Files:** `server/src/config/env.ts`, `server/src/config/db.ts`, `server/src/app.ts`, `server/src/index.ts`, `server/src/utils/ApiError.ts`, `server/src/middleware/errorHandler.ts`, `server/src/middleware/asyncHandler.ts`

- [ ] `utils/ApiError.ts` — class `ApiError extends Error { statusCode: number; constructor(statusCode, message) }`.
- [ ] `middleware/asyncHandler.ts` — wraps async route handlers, forwards rejections to `next`.
- [ ] `middleware/errorHandler.ts` — Express error middleware: if `err instanceof ApiError` respond `{message}` with `err.statusCode`, else log + `500 {message: "Internal server error"}`.
- [ ] `config/env.ts` — reads `process.env`, throws at boot if `MONGODB_URI` or `JWT_SECRET` missing.
- [ ] `config/db.ts` — `connectDB()` using `mongoose.connect(env.MONGODB_URI)`.
- [ ] `app.ts` — `express()` with `cors({origin: env.CLIENT_ORIGIN, credentials: true})`, `express.json()`, `/api` router (Task 6 fills routes), `errorHandler` last.
- [ ] `index.ts` — `connectDB().then(() => app.listen(env.PORT))`.
- [ ] Verify: `npm run dev -w server` starts, logs "Mongo connected" + "Server on :4000", `GET /api/health` (add a trivial route returning `{status:"ok"}`) returns 200 via `curl`.
- [ ] Commit: `feat(server): app bootstrap, config, error handling`

## Task 3: Models + Seed Script

**Files:** `server/src/models/User.ts`, `Product.ts`, `Order.ts` (code above), `server/src/seed/products.data.ts`, `server/src/seed/seed.ts`, `server/package.json` (`seed` script)

- [ ] Create the three models exactly as specified in Data Models above.
- [ ] `seed/products.data.ts` — array of 15 raw product definitions (title, slug, price in cents, description, category, variant axes per the catalog table, filenames referencing `media/`). Prices: realistic streetwear range, e.g. t-shirts 2900–3900, hoodies 6900–8900, jackets 12900–16900, pants 6900–8900, sneakers 9900–14900, accessories 1900–7900 (final numbers assigned per item, all in cents).
- [ ] `seed/seed.ts`:
  1. Copies every file referenced from `../../../media` into `../../../client/public/products/<slug>/<file>` (creating dirs as needed) — `fs.cpSync`.
  2. Connects to Mongo, `Product.deleteMany({})`, inserts the 15 products with `images`/`thumbnail` pointing at `/products/<slug>/<file>`.
  3. Upserts one demo user: `demo@example.com` / `Passw0rd!` (hashed with `bcryptjs`, 10 rounds) if not already present.
  4. Logs a summary table (product count, demo credentials) and exits.
- [ ] Add `"seed": "ts-node-dev --transpile-only src/seed/seed.ts"` to `server/package.json`.
- [ ] Run `npm run seed -w server`; verify via `mongosh ecommerce_platform --eval "db.products.countDocuments()"` → `15`, and `client/public/products/` contains 15 folders with images.
- [ ] Commit: `feat(server): product/user/order models + seed script with real catalog`

## Task 4: Auth (register/login/me + JWT middleware)

**Files:** `server/src/utils/jwt.ts`, `server/src/middleware/auth.ts`, `server/src/validators/auth.validators.ts`, `server/src/middleware/validate.ts`, `server/src/controllers/auth.controller.ts`, `server/src/routes/auth.routes.ts`, `server/src/types/express/index.d.ts`, `server/tests/integration/auth.test.ts`

- [ ] `types/express/index.d.ts` — `declare global { namespace Express { interface Request { userId?: string } } }`.
- [ ] `utils/jwt.ts` — `signToken(userId: string): string` (uses `JWT_SECRET`, `JWT_EXPIRES_IN`), `verifyToken(token): {sub: string}`.
- [ ] `middleware/auth.ts` — `requireAuth`: reads `Authorization: Bearer <token>`, 401 `ApiError` if missing/invalid, else sets `req.userId = payload.sub`.
- [ ] `middleware/validate.ts` — `validate(schema: ZodSchema)` returns middleware that parses `req.body`, 400 `ApiError` with zod issues on failure.
- [ ] `validators/auth.validators.ts` — `registerSchema {name: string().min(1), email: string().email(), password: string().min(8)}`, `loginSchema {email, password}`.
- [ ] `controllers/auth.controller.ts` — `register` (409 if email taken, hash password, create user, sign token, return `{user: {id,name,email}, token}`), `login` (401 "Invalid credentials" if not found or password mismatch via `bcrypt.compare`), `me` (reads `req.userId`, 404 if somehow missing, else returns sanitized user).
- [ ] `routes/auth.routes.ts` — wires the three routes, `me` behind `requireAuth`.
- [ ] Write `tests/integration/auth.test.ts` using `mongodb-memory-server` + `supertest`: register succeeds → 201 with token; duplicate email → 409; login wrong password → 401; `/me` without token → 401; `/me` with valid token → 200 with matching email.
- [ ] Run `npm run test -w server` — all auth tests pass.
- [ ] Commit: `feat(server): JWT auth (register/login/me) with tests`

## Task 5: Product Listing + Detail API

**Files:** `server/src/controllers/product.controller.ts`, `server/src/routes/product.routes.ts`, `server/tests/integration/products.test.ts`

- [ ] `controllers/product.controller.ts`:
  - `list`: `Product.find().select("slug title price thumbnail variants")`, map each to `{..., hasVariants: variants.length > 0, priceRange: null}` (price is fixed across variants in this catalog — no per-variant price override, keep it simple and say so in notes).
  - `getById`: `Product.findById(id)`, 404 `ApiError` if not found; returns full doc plus a computed `totalStock` (sum of all option stocks across axes, or `baseStock` if none).
- [ ] `routes/product.routes.ts` — both routes public (no `requireAuth` — browsing doesn't require login per spec's login-gates-the-app framing being about cart/wishlist/checkout; **decision to confirm with user in review**: if they'd rather gate browsing too, flip this to `requireAuth`).
- [ ] `tests/integration/products.test.ts`: seed 2 fixture products in-memory, `GET /products` returns array of length 2 with expected shape; `GET /products/:badId` → 404.
- [ ] Commit: `feat(server): product listing + detail endpoints with tests`

## Task 6: Cart Service + API

**Files:** `server/src/services/cart.service.ts`, `server/src/validators/cart.validators.ts`, `server/src/controllers/cart.controller.ts`, `server/src/routes/cart.routes.ts`, `server/src/routes/index.ts`, `server/tests/unit/cart.service.test.ts`, `server/tests/integration/cart.test.ts`

- [ ] `services/cart.service.ts` — pure-ish functions taking a `IUser` doc + `IProduct` docs:
  - `resolveAvailableStock(product: IProduct, selection: Record<string,string>): number` — implements the stock resolution rule from Data Models.
  - `buildCartView(user: IUser): Promise<{items: CartLineView[], total: number}>` — populates each cart item's product, computes `unitPrice`, `subtotal = unitPrice*quantity`, `availableStock`, sums `total`.
  - `addItem(user, {productId, variantSelection, quantity})` — validates product exists, validates `variantSelection` covers every axis on the product exactly, validates `quantity <= availableStock`, merges into existing line if same product+selection already in cart (increments quantity, re-checks stock), else pushes new line. Throws `ApiError(400, ...)` on any violation.
  - `updateItem(user, itemId, {quantity?, variantSelection?})` — same validations, mutates the matching cart subdocument; 404 if `itemId` not in cart.
  - `removeItem(user, itemId)`.
- [ ] `validators/cart.validators.ts` — `addToCartSchema {productId: string(), variantSelection: record(string()).default({}), quantity: number().int().positive()}`, `updateCartSchema` (both fields optional, at least one required — `.refine`).
- [ ] `controllers/cart.controller.ts` — `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`; each calls the service then responds with the fresh `buildCartView` result.
- [ ] `routes/cart.routes.ts` — all four behind `requireAuth`.
- [ ] `routes/index.ts` — mounts `/auth`, `/products`, `/cart`, `/wishlist` (Task 7), `/orders` (Task 8).
- [ ] `tests/unit/cart.service.test.ts` (no DB — construct plain objects matching the Mongoose doc shape): `resolveAvailableStock` returns the min across matching axis options; returns `baseStock` when no variants; `addItem` throws when quantity exceeds available stock; `addItem` merges duplicate selection instead of duplicating a line.
- [ ] `tests/integration/cart.test.ts` (memory-server): full flow — register, add item, `GET /cart` shows it with correct subtotal, `PATCH` quantity updates total, `DELETE` empties cart; adding beyond stock → 400.
- [ ] Commit: `feat(server): cart service + API with stock validation and tests`

## Task 7: Wishlist API

**Files:** `server/src/controllers/wishlist.controller.ts`, `server/src/routes/wishlist.routes.ts`

- [ ] `controllers/wishlist.controller.ts` — `getWishlist` (populate `wishlist`), `addToWishlist` (dedupe — `$addToSet`), `removeFromWishlist` (`$pull`). All operate on `req.userId`.
- [ ] `routes/wishlist.routes.ts` — three routes, `requireAuth`.
- [ ] Manual verification via `curl`/Postman (covered more thoroughly by frontend e2e usage in Task 15) — add a product, confirm it appears, remove it, confirm empty.
- [ ] Commit: `feat(server): wishlist endpoints`

## Task 8: Orders (Checkout) Service + API

**Files:** `server/src/services/order.service.ts`, `server/src/controllers/order.controller.ts`, `server/src/routes/order.routes.ts`, `server/tests/unit/order.service.test.ts`

- [ ] `services/order.service.ts` — `placeOrder(user: IUser)`:
  1. 400 `ApiError` if `user.cart.length === 0`.
  2. For every cart line, re-fetch the product, re-validate `resolveAvailableStock >= quantity` (race-safety against stale cart) — 409 `ApiError` naming the offending product if it now fails.
  3. Build `IOrderItem[]` snapshot (title/unitPrice/subtotal frozen at order time).
  4. Decrement the matching variant option's `stock` (or `baseStock`) on each `Product` by the ordered quantity.
  5. Create the `Order`, clear `user.cart = []`, save both.
  6. Return the created order.
- [ ] `controllers/order.controller.ts` — `createOrder` (calls service, 201 `{order}`), `getOrder` (404 if not found or not owned by `req.userId`).
- [ ] `routes/order.routes.ts` — both behind `requireAuth`.
- [ ] `tests/unit/order.service.test.ts`: happy path decrements stock and returns correct total; empty cart throws 400; insufficient stock throws 409 and does **not** mutate the cart or stock (transactional integrity at the unit level — assert no partial writes).
- [ ] Commit: `feat(server): checkout/order service with stock decrement and tests`

## Task 9: Backend Verification Pass

- [ ] `npm run test -w server` — full suite green.
- [ ] `npm run seed -w server` then manually exercise the full flow with `curl` (register → login → list products → add to cart → checkout) to confirm end-to-end wiring before moving to frontend.
- [ ] Commit (if any fixes needed): `fix(server): <description>`

## Task 10: Frontend Foundations (API client, types, query client, router shell, global styles)

**Files:** `client/src/api/client.ts`, `client/src/lib/queryClient.ts`, `client/src/lib/formatCurrency.ts`, `client/src/types/index.ts`, `client/src/store/authStore.ts`, `client/src/router.tsx`, `client/src/App.tsx`, `client/src/main.tsx`, `client/src/styles/globals.css`, `client/index.html`

- [ ] `types/index.ts` — mirrors the API contract: `Product`, `ProductSummary`, `VariantAxis`, `CartLine`, `CartView`, `Order`, `User`.
- [ ] `store/authStore.ts` — Zustand + `persist` middleware, `{token, user, setAuth(user, token), logout()}`, persisted key `ecommerce-auth`.
- [ ] `api/client.ts` — `axios.create({baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"})`; request interceptor attaches `Authorization` from `authStore`; response interceptor on `401` calls `authStore.getState().logout()` and redirects to `/login`.
- [ ] `lib/formatCurrency.ts` — `formatCurrency(cents: number) => new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(cents/100)`.
- [ ] `lib/queryClient.ts` — `new QueryClient({defaultOptions:{queries:{retry:1, staleTime:30_000}}})`.
- [ ] `index.html` — Google Fonts `<link>` for Sora + Inter, `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- [ ] `styles/globals.css` — Tailwind directives + `:root` font-family tokens.
- [ ] `router.tsx` — routes table (paths listed in File Structure) wrapping protected ones in `ProtectedRoute` (Task 11).
- [ ] `App.tsx` — `<QueryClientProvider><RouterProvider .../></QueryClientProvider>`.
- [ ] Verify: `npm run dev -w client` renders a blank shell with no console errors, Tailwind classes apply.
- [ ] Commit: `feat(client): app shell, api client, auth store, routing skeleton`

## Task 11: Auth Pages + Route Guarding

**Files:** `client/src/api/auth.api.ts`, `client/src/hooks/useAuth.ts`, `client/src/components/layout/ProtectedRoute.tsx`, `client/src/pages/LoginPage.tsx`

- [ ] `api/auth.api.ts` — `login(email,password)`, `register(name,email,password)`, `me()` — thin wrappers over `api/client.ts`.
- [ ] `hooks/useAuth.ts` — exposes `{user, isAuthenticated, login, register, logout}` combining `authStore` + react-query mutations; on success calls `authStore.setAuth`.
- [ ] `components/layout/ProtectedRoute.tsx` — reads `isAuthenticated`; if false, `<Navigate to="/login" replace state={{from: location}} />`.
- [ ] `pages/LoginPage.tsx` — tabbed or toggle Login/Register form: labeled inputs (not placeholder-only), inline validation on blur, submit button shows spinner + disables while pending, error message rendered near the form on failure, redirects to `location.state?.from ?? "/"` on success. Includes a visible hint with the seeded demo credentials for reviewer convenience (`demo@example.com` / `Passw0rd!`).
- [ ] Manual check: visiting `/cart` while logged out redirects to `/login`; logging in redirects back to `/cart`.
- [ ] Commit: `feat(client): login/register page with route guarding`

## Task 12: Product Listing + Detail Pages

**Files:** `client/src/api/products.api.ts`, `client/src/hooks/useProducts.ts`, `client/src/components/product/ProductCard.tsx`, `ProductGrid.tsx`, `VariantSelector.tsx`, `client/src/pages/ProductListPage.tsx`, `ProductDetailPage.tsx`, `client/tests/VariantSelector.test.tsx`

- [ ] `api/products.api.ts` + `hooks/useProducts.ts` — `useProducts()` (list), `useProduct(id)` (detail) via react-query.
- [ ] `components/product/ProductGrid.tsx` — responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`), skeleton cards while loading, `EmptyState` if empty.
- [ ] `components/product/ProductCard.tsx` — thumbnail (aspect-ratio locked, `loading="lazy"`), title, price, "N colors" / "Sizes S–XL" badge when `hasVariants`, links to detail page. Whole card is a single tap target on mobile (≥44px).
- [ ] `components/product/VariantSelector.tsx` — renders one row of pill buttons per axis; disables (visually + `aria-disabled`) options whose `stock === 0`; controlled via props `{axes, selection, onChange}`; each pill has a visible focus ring and ≥44px hit area.
- [ ] `pages/ProductListPage.tsx` — header + `ProductGrid`.
- [ ] `pages/ProductDetailPage.tsx` — image gallery (main image + thumbnail strip, swappable on click/tap), title, price, full description, `VariantSelector` per axis, live "X in stock" text driven by current selection, quantity stepper (clamped to available stock), "Add to Cart" (disabled + "Out of stock" label when resolved stock is 0) and "Add to Wishlist" buttons, toast/inline confirmation on success.
- [ ] `tests/VariantSelector.test.tsx` — renders axes, clicking an option calls `onChange` with merged selection, out-of-stock option is disabled and not clickable.
- [ ] Manual check at 375px, 768px, 1440px: no horizontal scroll, gallery and selectors remain usable.
- [ ] Commit: `feat(client): product listing and detail pages with variant selection`

## Task 13: Cart Page

**Files:** `client/src/api/cart.api.ts`, `client/src/hooks/useCart.ts`, `client/src/components/cart/CartLineItem.tsx`, `CartSummary.tsx`, `client/src/pages/CartPage.tsx`

- [ ] `api/cart.api.ts` + `hooks/useCart.ts` — `useCart()` query, `useAddToCart`, `useUpdateCartItem`, `useRemoveCartItem` mutations, all invalidate the cart query on success (optimistic update optional — correctness over cleverness here).
- [ ] `components/cart/CartLineItem.tsx` — thumbnail, title, variant selection shown as text chips (with an "Edit" affordance that re-opens a compact `VariantSelector` inline to satisfy "adjust/change chosen variants"), `QuantityStepper` (calls update mutation, clamped to `availableStock`), per-item subtotal, remove button (with a confirmation per the forms/feedback guideline for destructive actions on small screens — a simple `window.confirm`-free inline "Remove?" toggle is enough here).
- [ ] `components/cart/CartSummary.tsx` — item count, total, "Proceed to Checkout" primary CTA (disabled + explanatory text if cart is empty).
- [ ] `pages/CartPage.tsx` — list of `CartLineItem` + `CartSummary`, `EmptyState` ("Your cart is empty" + link to products) when no items. Responsive: summary sticks to bottom on mobile, sits as a side column ≥`lg`.
- [ ] Manual check: update quantity reflects new subtotal/total immediately; removing the last item shows the empty state.
- [ ] Commit: `feat(client): cart page with quantity/variant editing`

## Task 14: Wishlist Page

**Files:** `client/src/api/wishlist.api.ts`, `client/src/hooks/useWishlist.ts`, `client/src/pages/WishlistPage.tsx`

- [ ] `api/wishlist.api.ts` + `hooks/useWishlist.ts` — query + add/remove mutations.
- [ ] `pages/WishlistPage.tsx` — grid of saved products (reuses `ProductCard` with a "Remove" affordance and a "Move to Cart" button — the spec's nice-to-have; moving opens the product's `VariantSelector` inline if it has variants, otherwise adds directly with quantity 1). `EmptyState` when empty.
- [ ] Wire "Add to Wishlist" on `ProductDetailPage` (Task 12) to this hook if not already done there.
- [ ] Commit: `feat(client): wishlist page with move-to-cart`

## Task 15: Checkout + Order Confirmation

**Files:** `client/src/api/orders.api.ts`, `client/src/pages/CheckoutPage.tsx`, `client/src/pages/OrderConfirmationPage.tsx`

- [ ] `api/orders.api.ts` — `placeOrder()`, `getOrder(id)`.
- [ ] `pages/CheckoutPage.tsx` — read-only review of cart lines + total (reusing `CartSummary`), "Place Order" button (loading state, disabled while pending, disabled if cart became empty), on success navigates to `/order-confirmation/:orderId`; on 409 (stock changed) shows the server's message and refreshes the cart query.
- [ ] `pages/OrderConfirmationPage.tsx` — fetches the order by id, shows order number, itemized summary, total, "Continue Shopping" link back to `/`. If the order id doesn't belong to the user (404), shows a friendly not-found state instead of crashing.
- [ ] Manual check: placing an order empties the cart (verify `/cart` shows empty state afterward) and the confirmation page survives a hard refresh (re-fetches by id).
- [ ] Commit: `feat(client): checkout flow and order confirmation`

## Task 16: Navigation Shell + Responsive Polish Pass

**Files:** `client/src/components/layout/Header.tsx`, `MobileNav.tsx`, `Footer.tsx`, `client/src/pages/NotFoundPage.tsx`, touch-ups across Tasks 11–15 files as needed

- [ ] `components/layout/Header.tsx` — logo/wordmark, desktop nav links (Products / Wishlist / Cart with item-count badge), user menu (name + logout), collapses to a hamburger triggering `MobileNav` below `md`.
- [ ] `components/layout/MobileNav.tsx` — full-height slide-in panel, same links, closes on route change, traps focus while open, closable via a visible close button (not swipe-only).
- [ ] `components/layout/Footer.tsx` — minimal, brand + copyright.
- [ ] `pages/NotFoundPage.tsx` — 404 for unmatched routes.
- [ ] Full responsive sweep at 375px / 768px / 1024px / 1440px across all seven pages (Login, List, Detail, Cart, Wishlist, Checkout, Confirmation): no horizontal scroll, nav usable, forms usable, images don't overflow, touch targets ≥44px. Fix anything that fails using the browser tool (Task 17 covers the actual verification pass with the live app).
- [ ] Commit: `feat(client): responsive navigation shell + cross-page polish`

## Task 17: Live Verification in Browser

- [ ] `npm run dev` from root (starts both servers), open in the Browser tool at desktop width: walk register → login → browse → detail (select variants) → add to cart → wishlist → cart edit → checkout → confirmation.
- [ ] Repeat the same walkthrough at `mobile` and `tablet` viewport presets (resize_window tool) — confirm no horizontal scroll, nav hamburger works, forms are usable.
- [ ] Check browser console for errors (`read_console_messages`) at each step — zero errors/warnings tolerated beyond known third-party noise.
- [ ] Fix anything found; commit fixes as `fix(client): <description>` / `fix(server): <description>`.

## Task 18: README + Reference Notes + AI Usage Draft

**Files:** `README.md`, `docs/NOTES_DATABASE.md`, `docs/NOTES_BACKEND.md`, `docs/NOTES_FRONTEND.md`, `docs/AI_USAGE_DRAFT.md`

- [ ] `README.md` — project overview, prerequisites (Node 24, local MongoDB), setup (`npm install`, `cp server/.env.example server/.env`, `npm run seed`, `npm run dev`), demo credentials, folder map, how to run tests.
- [ ] `docs/NOTES_DATABASE.md` — bullet reference notes only: why MongoDB/Mongoose for this shape of data, the embedded-cart-on-User vs. separate-collection tradeoff and why embedded was chosen at this scale, the variant/stock-resolution simplification and its limits, indexing decisions (`email` unique, `slug` unique). **Labeled clearly at the top as reference material for the user to rewrite in their own words — not a submission-ready doc.**
- [ ] `docs/NOTES_BACKEND.md` — bullets: layered controller/service/model structure and why, centralized error handling + `ApiError` pattern, zod validation boundary, JWT choice (stateless, Bearer-in-localStorage tradeoff vs. httpOnly cookies — explicitly note the XSS tradeoff accepted for this scope), testing strategy (unit vs. integration split, `mongodb-memory-server`). Same "rewrite in your own words" label.
- [ ] `docs/NOTES_FRONTEND.md` — bullets: react-query for all server state vs. a global store, why Zustand only for auth/UI state, component boundaries (`pages` vs. `components/*` by domain), Tailwind + design-token approach, accessibility/responsive checklist applied. Same label.
- [ ] `docs/AI_USAGE_DRAFT.md` — factual, dated log: which assistant, what was generated vs. reviewed/edited by hand, which decisions were the user's own. Same "rewrite manually" label at the top.
- [ ] Commit: `docs: README + architecture reference notes + AI usage draft`

## Task 19: Final Verification Pass

- [ ] `npm run test` (root) — full backend + frontend suite green.
- [ ] `npm run build` (root) — both workspaces build without TypeScript errors.
- [ ] Re-run the Task 17 browser walkthrough once more end-to-end on the built output if time allows (`vite preview` for client, `node dist/index.js` for server) — optional but recommended before calling it done.
- [ ] Final commit: `chore: final verification pass`

---

## Self-Review Notes (completed during plan authoring)

- **Spec coverage:** Auth ✓(Task 4/11), Listing w/ title+price+variants ✓(5/12), Detail w/ description+stock+variants+add-to-cart+wishlist ✓(5/6/12), Cart add/view/update-qty/remove/change-variant ✓(6/13), Wishlist view+add + move-to-cart nice-to-have ✓(7/14), Checkout mocked place-order + confirmation ✓(8/15), Responsive mandatory ✓(16/17), Version control strategy ✓(monorepo decision documented above + in README), Architecture docs ✓(19, correctly scoped as user-authored), AI usage doc ✓(18, correctly scoped as user-authored), enterprise-grade scope ✓(layered backend, typed contracts, tests, centralized errors throughout).
- **Open decision flagged for user review, not yet locked:** Task 5 leaves product browsing (`/products`, `/products/:id`) **public** (no login required), reasoning that "login gates the app" is most naturally about cart/wishlist/checkout while still letting a reviewer browse without creating an account first. Flip to `requireAuth` on those two routes in Task 5 if the user prefers the whole app gated.
