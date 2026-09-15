# Backend — Reference Notes (NOT the submission document)

> These are compressed, factual bullet notes on the decisions made in `server/src/`. The assessment requires a **Backend** architecture document written manually, in your own words, with no AI assistance. Use these as raw material — rewrite them yourself; do not submit this file or a lightly-edited copy of it.

## Layering

- `routes` (wiring + auth/validation middleware) → `controllers` (HTTP concerns: parse req, call service, shape response) → `services` (business logic: stock resolution, cart mutation rules, checkout) → `models` (schema + persistence).
- The split between `controllers` and `services` specifically exists because cart/order logic has real rules worth unit-testing in isolation (stock resolution, merge-on-add, checkout validation) without spinning up HTTP or even a full request — see `tests/unit/`.

## Error handling

- A single `ApiError(statusCode, message)` class thrown from anywhere in the request lifecycle; `asyncHandler` wraps every async route handler so a thrown/rejected error always reaches `next()`; one `errorHandler` middleware at the end of the chain converts it to a JSON response.
- Two "unhandled" Mongoose error types get special-cased in `errorHandler` rather than leaking a raw 500: `CastError` (malformed ObjectId in a URL param, e.g. `/api/products/not-an-id`) → 400, and duplicate-key `MongoServerError` (code 11000) → 409. Both are the kind of edge case the assessment explicitly calls out ("handle edge cases").

## Validation

- `zod` schemas at the route boundary (`validate(schema)` middleware) for request bodies — register/login and cart add/update. Chose route-boundary validation over Mongoose schema validation alone because I want a 400 with a clear message *before* touching the database, not a Mongoose ValidationError translated after the fact.

## Auth

- Stateless JWT, `Authorization: Bearer <token>`, `requireAuth` middleware sets `req.userId`. Password hashing via bcrypt (10 rounds).
- **Known tradeoff**: the frontend stores the token in `localStorage` (via a persisted Zustand store) rather than an httpOnly cookie. That's simpler to wire up across two dev-server origins without cookie/CORS configuration, but it means a successful XSS on the frontend could read the token. For a real production app handling real accounts, I'd move to an httpOnly, SameSite cookie issued by the backend instead. Flagging this explicitly rather than pretending it isn't a tradeoff.
- Product browsing is intentionally left public (no `requireAuth` on `GET /products*`) — the spec's "gate access to the app" reads most naturally as gating cart/wishlist/checkout, and letting a reviewer browse without creating an account first is friendlier. This is a judgment call, not a strict reading of the spec — flip `requireAuth` onto those two routes if the whole app should be gated instead.

## Email verification / password reset (OTP)

- Added after the base spec, at the user's request — not in the original PDF.
- `User.otp` is a single nested subdocument (`codeHash`, `purpose`, `expiresAt`, `attempts`, `lastSentAt`) reused for both `verify-email` and `reset-password` rather than two parallel field sets — a user can only be mid-flow on one of them at a time anyway. The code itself is bcrypt-hashed at rest, same as the password, so a DB read alone can't hand out a valid OTP.
- Register no longer logs the user in immediately: it creates the account with `emailVerified: false`, emails a 6-digit code (Resend), and returns no token. Login is blocked (403, machine-readable `code: "EMAIL_NOT_VERIFIED"` in `details`) until `/auth/verify-email` succeeds, which is the point a token is actually issued.
- **Consistency edge case caught in review**: if the OTP email send throws *after* the user document is already created, that would leave an orphaned, permanently-unverifiable account (email now taken, but the shopper never got a code, and re-registering that email just 409s forever). `register` now rolls back (deletes the just-created user) on a send failure instead of leaving that dangling state.
- `forgot-password` always returns the same generic response regardless of whether the email exists, to avoid leaking which emails are registered — the one accepted leak is that a 429 (cooldown) response is only reachable for an email that does exist, since only a real account has OTP state to be on cooldown. Flagging that as a known, minor tradeoff rather than something engineered around, since closing it fully wasn't worth the complexity at this scale.
- Resend cooldown (60s) and a max-attempts cap (5) on OTP checks are both enforced server-side, not just in the UI, so they can't be bypassed by hitting the API directly.
- Sending real email means this is a dependency on an external provider (Resend) — the register/resend/forgot-password endpoints are the first place in this codebase where a "business logic succeeded but the outbound side-effect failed" scenario had to be explicitly handled, rather than being purely a DB-consistency concern like the rest of the API.

## Admin product management

- Added after the base spec, at the user's request — not in the original PDF.
- No separate admin auth system — `User.role` (`"user" | "admin"`) on the same model, checked by a `requireAdmin` middleware that runs after `requireAuth` and re-fetches the role from the DB on every request rather than trusting a claim baked into the JWT. Deliberate choice: a role change (or a demoted admin) takes effect immediately instead of only after the token expires, and it avoids standing up a second, parallel auth system for what is fundamentally still "a user, with a flag."
- Admin routes (`/api/admin/*`) are a fully separate route namespace from the public `/api/products*` — the public listing/detail intentionally return a trimmed shape (no per-option images, a computed `totalStock`), while admin CRUD returns/accepts the raw document shape, since the dashboard needs to edit every field, not just display a subset.
- Image uploads went through two designs. First pass: `multer` disk storage writing into `client/public/uploads/`, served by Vite's static handling — simple, but broke the moment deployment became real: most hosts don't give a backend process a persistent writable disk (serverless especially), and even where they do, `vite build` only copies `public/` into `dist/` once, so a post-build upload would never appear. Replaced with `multer.memoryStorage()` (buffer in RAM only) streaming straight to Cloudflare R2 (`services/storage.service.ts`, S3-compatible API via `@aws-sdk/client-s3`) — the upload endpoint returns R2's public CDN URL, and every downstream consumer (Product doc, `<img src>`) was already just storing/rendering a URL, so nothing else had to change. Chose R2 over the more obvious Cloudinary specifically because Cloudinary's service wasn't available in the user's country — worth remembering that "the standard SaaS pick" isn't universally reachable, and that Cloudflare's broader footprint (it's fundamentally a CDN company) made R2 the safer bet on availability.
- Same-pattern global test mock as `email.service` (`tests/setup.ts`) — no test suite ever performs a real R2 upload; `services/storage.service.ts`'s `uploadImageBuffer` is mocked to return a fixed URL, and the upload endpoint's tests (auth-gating, the mocked URL round-tripping, non-image rejection) verify against that. The real integration was verified once, manually, outside the test suite — see `NOTES_FRONTEND.md` deploy notes.
- Deleting a product is a genuinely new capability this feature introduces, and it exposed an existing edge case: a product that's still sitting in someone's wishlist. `Product.findByIdAndDelete` doesn't touch other collections, so a wishlisted-then-deleted product used to come back from `populate("wishlist")` as a `null` entry — the wishlist endpoints now filter those out before responding, rather than handing the frontend a wishlist item with no product underneath it. Cart lines already handled this gracefully (skip the line if the product 404s); this closes the same gap for wishlists.

## Editable homepage hero

- Added after the base spec, at the user's request — the homepage banner (eyebrow, headline, supporting text, button label, images) was hardcoded in the frontend; now it's admin-editable.
- Stored as a `SiteContent` document keyed by section (`key: "hero"`), not a `Hero` model. One document today, but a second editable block (promo strip, footer blurb) becomes a new row rather than a new model + new route + new controller. The tradeoff is a schema that's shaped for the hero specifically — if the sections diverge a lot, this becomes the wrong abstraction and each would want its own model.
- Read path is split: `GET /api/site-content/hero` is public (the storefront homepage), `PUT /api/admin/site-content/hero` sits inside the existing admin namespace and inherits `requireAuth` + `requireAdmin` unchanged. No new auth surface.
- The write is a `findOneAndUpdate(..., { upsert: true })` rather than a plain update — there is only ever one hero, and upserting means the endpoint still works against a database that was never seeded.
- **Empty-state handling.** Two separate problems, easy to conflate: (a) an admin saving blank copy, and (b) no hero document existing at all. Required fields in the zod schema only solve (a). For (b) the defaults live in `seed/hero.data.ts` and are used by *both* the seed (which inserts the document) and the public GET (which falls back to them if the document is missing) — so the homepage cannot render a blank hero, and the default copy is defined in exactly one place rather than duplicated as hardcoded JSX fallbacks.
- The seed inserts the hero with `$setOnInsert`, never overwriting — re-running `npm run seed` after an admin has edited the homepage shouldn't silently revert their copy. Contrast with `seedProducts`, which deliberately does `deleteMany` + re-insert, since the 15-product catalog *is* fixture data.
- Image count is capped at 4 in three places on purpose: the zod schema (the real boundary), the Mongoose validator (so a direct DB write can't produce an unrenderable document), and the frontend uploader (so the admin finds out while picking files, not at submit). The cap exists because the frontend has a hand-built layout per count — it's a design constraint, not an arbitrary limit.

## Product reviews

- Added after the base spec, at the user's request — genuinely no ratings anywhere in the original PDF, and deliberately not faked: every product starts at 0 reviews rather than showing decorative placeholder stars.
- Explicitly not gated to "verified purchase" — any authenticated user can review any product once. A real storefront would check the user has an `Order` containing that product first; skipped here because the plan is to review from multiple manually-created test accounts, not real completed orders.
- Reviews live under `/api/products/:id/reviews` (nested route, `mergeParams` router) rather than a flat `/api/reviews?product=...` — the product id is always the access pattern, so it belongs in the path.
- Submitting a second review for the same product is a `findOneAndUpdate` with `upsert: true` against the unique `{product, user}` index, not a 409 — "leave a review" and "edit your review" are the same form and the same request on the frontend, no separate edit flow to build or explain.

## Order history

- `GET /api/orders` added for the account page's purchase history — scoped to `req.userId` and sorted newest first. The route sits above `GET /:id` in `order.routes.ts`; registered the other way round, Express would match the bare path against the `:id` param.
- Ownership is enforced in the query itself (`Order.find({ user: req.userId })`) rather than by fetching and filtering afterwards, the same shape as the existing `getOrder`. `tests/integration/orders.test.ts` covers the leak case directly: a second account asking for orders gets an empty list, not someone else's purchases.

## Checkout / concurrency

- `placeOrder` re-validates every cart line's stock *before* mutating anything (see `order.service.ts`), so a stale cart (stock changed since the item was added) fails cleanly with a 409 and leaves the cart and product stock untouched — verified in `tests/unit/order.service.test.ts`.
- This is optimistic, last-writer-wins concurrency control, not true transactional isolation — two simultaneous checkouts for the last unit of the same variant could both pass the pre-check in a real race. A production system would use a MongoDB transaction (or a reservation/hold pattern) around the read-check-decrement sequence. Not implemented here because MongoDB transactions require a replica set, which is more infra than this take-home warrants — noting the gap rather than hiding it.

## Testing strategy

- Unit tests (`tests/unit/`) for the two places with real business logic and no meaningful HTTP surface to test through: `resolveAvailableStock` and `placeOrder`.
- Integration tests (`tests/integration/`) using `mongodb-memory-server` + Supertest for the actual HTTP contracts (auth, products, cart) — these are the ones that would catch a broken route wiring or a validation regression.
