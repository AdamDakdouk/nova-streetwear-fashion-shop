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

## Checkout / concurrency

- `placeOrder` re-validates every cart line's stock *before* mutating anything (see `order.service.ts`), so a stale cart (stock changed since the item was added) fails cleanly with a 409 and leaves the cart and product stock untouched — verified in `tests/unit/order.service.test.ts`.
- This is optimistic, last-writer-wins concurrency control, not true transactional isolation — two simultaneous checkouts for the last unit of the same variant could both pass the pre-check in a real race. A production system would use a MongoDB transaction (or a reservation/hold pattern) around the read-check-decrement sequence. Not implemented here because MongoDB transactions require a replica set, which is more infra than this take-home warrants — noting the gap rather than hiding it.

## Testing strategy

- Unit tests (`tests/unit/`) for the two places with real business logic and no meaningful HTTP surface to test through: `resolveAvailableStock` and `placeOrder`.
- Integration tests (`tests/integration/`) using `mongodb-memory-server` + Supertest for the actual HTTP contracts (auth, products, cart) — these are the ones that would catch a broken route wiring or a validation regression.
