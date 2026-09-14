# Database — Reference Notes (NOT the submission document)

> These are compressed, factual bullet notes on the decisions made in `server/src/models/`. The assessment requires a **Database** architecture document written manually, in your own words, with no AI assistance. Use these as raw material to jog your memory — rewrite them yourself; do not submit this file or a lightly-edited copy of it.

## Why MongoDB / Mongoose

- Catalog data (products with a variable number of variant axes, each with a variable number of options) is naturally document-shaped — a relational schema would need either a rigid `product_variants` join table (fine, but more ceremony for 15 products) or an EAV pattern (worse). A nested document maps 1:1 to how the UI actually consumes it.
- Local MongoDB was already running in the dev environment, and the assessment explicitly allows any storage approach — MongoDB was the path of least friction that still demonstrates real schema/validation/indexing decisions (vs. an in-memory array, which wouldn't).

## Schema decisions

- **`Product`**: `variants: [{ name, options: [{ value, stock }] }]`. Two independent axes in practice (Color, Size) rather than a single flattened "SKU" list — keeps the seed data and the UI simple, at the cost of not modeling per-combination stock (see below).
- **Stock resolution simplification**: available stock for a given selection = `min(option.stock)` across every axis the user has picked, not a true per-combination inventory count. A real system selling thousands of units would want a `variantCombination -> stock` map (or a proper SKU table) so that, e.g., "Blue + XL" and "Blue + S" don't share a stock number when they shouldn't. This project's scale (15 products, take-home timeframe) didn't justify that complexity — documented so it reads as a deliberate tradeoff, not an oversight.
- **Cart and Wishlist embedded on `User`** rather than their own collections:
  - Pro: one document read gets you the whole cart; no orphaned-cart cleanup; simplest possible model for "each user has exactly one cart."
  - Con: doesn't scale to carts with thousands of lines, and you can't easily query "all carts containing product X" without a collection scan. Both are non-issues at this scale.
  - If this were a multi-warehouse, high-traffic store, I'd split `Cart` into its own collection keyed by user, and likely move to a real per-SKU inventory model with reservation/holds during checkout.
- **`Order`** is its own collection with a frozen snapshot of each line's title/price at purchase time — orders must not change retroactively if the product catalog changes later. This is the one place a normalized "just reference the product" approach would be a real bug, not just a simplification.
- **Money as integer cents** everywhere (`price`, `unitPrice`, `subtotal`, `total`) — avoids floating point drift in totals; formatted to dollars only at the UI edge.
- **Indexes**: `email` unique on `User`, `slug` unique on `Product`, and a compound unique index `{product, user}` on `Review` — the last one is what makes "resubmitting a review updates it" an upsert instead of application-level duplicate-checking logic.
- **`Review` rating average is computed live via aggregation, not stored denormalized on `Product`.** Considered caching `avgRating`/`reviewCount` directly on the product document (cheaper reads), but at 15 products a `$group` aggregate is trivial, and it means the number shown can never drift from the underlying reviews — no risk of forgetting to recompute on edit/delete. Would revisit if the catalog were large enough for the aggregate to show up in a profiler.

## What I'd change for a "real" production version

- Per-combination stock (or a proper SKU model) instead of per-axis-option stock.
- A reservation/hold step during checkout to avoid a race between two users buying the last unit simultaneously (currently: last-writer-wins re-validation at order time, see `NOTES_BACKEND.md`).
- Move `Cart` to its own collection once cart size or query patterns justify it.
