# Frontend — Reference Notes (NOT the submission document)

> These are compressed, factual bullet notes on the decisions made in `client/src/`. The assessment requires a **Frontend** architecture document written manually, in your own words, with no AI assistance. Use these as raw material — rewrite them yourself; do not submit this file or a lightly-edited copy of it.

## State management split

- **Server state (products, cart, wishlist, orders) lives entirely in TanStack Query**, not in a client-side store. The cart in particular is a case where the server is the only source of truth that matters (stock validation happens server-side) — keeping a parallel client-side cart store would just be another place for it to drift out of sync. Every mutation (`useAddToCart`, `useUpdateCartItem`, ...) writes its response straight into the query cache via `setQueryData`, so the UI updates from the server's own response rather than an optimistic guess.
- **Zustand is used for exactly one thing**: the auth token + user, persisted to `localStorage` (`store/authStore.ts`). That's genuinely client-only state (nothing to fetch, nothing to reconcile), so a full server-state library would be overkill for it.

## Component boundaries

- `pages/` = one file per route, responsible for data-fetching + composing components, not markup-heavy.
- `components/<domain>/` (`product/`, `cart/`) = domain-specific composed components.
- `components/ui/` = generic, product-agnostic primitives (`Button`, `QuantityStepper`, `EmptyState`, `Toast`) that don't know what a "product" or "cart" is.
- `components/layout/` = app chrome (`Header`, `MobileNav`, `Footer`, `ProtectedRoute`) that wraps every page via a layout route.

## Variant/stock UI

- `lib/stock.ts` mirrors the backend's stock-resolution rule (`min` across selected axis options) purely so the UI can disable out-of-stock pills and clamp the quantity stepper *before* round-tripping to the server. It is explicitly a UI convenience, not a second source of truth — every mutation still gets re-validated server-side, and the UI reconciles to whatever the server actually returns.

## Styling / design system

- Tailwind with a small custom token set in `tailwind.config.js` (background/ink/charcoal/accent/success/danger + `font-heading`/`font-body`) rather than raw hex values scattered through components — one place to adjust the whole palette.
- One accent color (`#C2410C`, a muted rust/terracotta) used consistently for primary actions and active/selected states, chosen to read as a considered streetwear-boutique palette rather than a loud or generic one.
- Accessibility basics applied throughout rather than bolted on after: visible focus rings (`.focus-ring` utility) on every interactive element, ≥44px touch targets on buttons/steppers/variant pills, `aria-live` regions for stock text and toasts, labeled form fields (not placeholder-only).

## Auth flow (email verification / password reset)

- Added after the base spec, at the user's request. Modeled as its own small set of routes (`/verify-email`, `/forgot-password`, `/reset-password`) rather than cramming more mode-switches into `LoginPage`, since each step has a genuinely different job (enter credentials vs. enter a code vs. set a new password) and needs its own back/forward-navigable URL.
- `useResendCooldown` is a tiny reusable hook (wall-clock end-time, not a naive `setInterval` counter) shared by the verify-email and reset-password screens so the 60s "resend code" cooldown stays accurate even if the tab is backgrounded and throttled.
- The register mutation intentionally does **not** call `setAuth` on success anymore (see `useAuth.ts`) — the account isn't usable yet, so nothing should look logged in until `/auth/verify-email` actually returns a token.

## Admin dashboard

- Added after the base spec, at the user's request. Lives entirely outside `AppLayout` — its own route subtree in `router.tsx` (`/admin/login`, `/admin`, `/admin/products/new`, `/admin/products/:id/edit`) with no shared header/footer/toast-dialog chrome from the storefront, and no link to it anywhere in the public UI (`Header`, `MobileNav`, `Footer`). Reachable only by knowing the URL, and gated twice over: `AdminRoute` checks `role === "admin"` client-side (UX — redirect before rendering anything), the backend's `requireAdmin` is the actual security boundary.
- Reuses the same `authStore`/JWT as the storefront rather than a parallel session system — an admin logging in via `/admin/login` is just hitting the same `/auth/login` endpoint; the page checks the returned role and immediately logs back out (clears the token) if it isn't `"admin"`, rather than silently landing them on the customer storefront logged in as themselves.
- The variant editor (`VariantAxisEditor`) mirrors the exact nested shape the backend expects (`variants: [{ name, options: [{ value, stock, images? }] }]`) directly in component state — no intermediate form-library schema — since the shape is small and the whole point is that what's submitted is what's stored, one-to-one.
- Image uploads happen immediately on file selection (not deferred to form submit) — each file is POSTed to `/api/admin/upload` as soon as it's picked, and the returned URL is what gets stored in form state. Keeps the "did this upload actually succeed" question answered before the admin ever hits Save, instead of surfacing an upload failure buried inside a larger product-save error.
- Those URLs are absolute (`https://<bucket>.r2.dev/products/...`), not relative paths like the seeded catalog images (`/products/<slug>/...`) — the `<img>` tags don't care either way, but it's why admin-uploaded photos load from Cloudflare's CDN while everything from the original 15-product seed loads from wherever the frontend itself is hosted. Verified for real (not just mocked) after the switch from local-disk storage to R2: uploaded a real file through the actual API with the actual R2 credentials, then re-fetched the returned URL directly and confirmed it served back the identical image.

## Editable homepage hero

- Added after the base spec, at the user's request. `HeroBanner` went from a component with its copy and image hardcoded inline to a pure presentational component taking a `hero` prop — `ProductListPage` fetches it via `useHero()` and passes it down. The component itself got *simpler*, not more complex, because it stopped owning content.
- **Image layouts are per-count, not one generic grid.** 1 image keeps the original single-portrait treatment; 2 sit side by side as portraits; 3 becomes one full-height feature image beside two stacked squares; 4 is a 2×2. A single responsive grid that "just reflows" would have left a lone image stretched or a third image orphaned on its own row — the whole point of the cap at 4 is that each count gets a layout that was actually looked at. Extra images beyond 4 are sliced off client-side too, so bad data degrades instead of breaking the banner.
- The headline is a single string where newlines are meaningful (rendered as `<span className="block">` per line) rather than separate `headingLine1`/`headingLine2` fields. Keeps the admin form to one textarea, and doesn't bake "the headline is exactly two lines" into the schema.
- The admin editor renders the **real `HeroBanner`** as a live preview, fed from form state rather than from the saved document. Possible only because the component became props-driven — and it means the preview can't drift from the storefront, since there is no second copy of the markup to keep in sync.
- `useUpdateHero` writes the saved response into both the `["hero"]` and `["admin","hero"]` query caches via `setQueryData` rather than just invalidating, so an admin who saves and then opens the storefront in the same session sees the new hero immediately instead of a stale cached one.
- The hero renders on **every** listing view, not just the unfiltered one. It was originally gated to the default view, which meant clicking a category unmounted a ~740px block above the product grid and clicking "All" mounted it again — and since scroll position resets on filter changes anyway, that made "All" the one filter that visibly threw the page around while the others looked still. Keeping the block above the grid constant means no filter moves the viewport at all, with no scroll-management code: two attempts at fixing this by scrolling the grid into view both failed (a first-render guard isn't idempotent under StrictMode's double-invoked effects, and the browser's scroll anchoring re-adjusts after a passive effect has already moved the position). Removing the layout change was smaller and more reliable than compensating for it.
- `ImageUploader` gained an optional `max` prop (unlimited when omitted, so the product form is unchanged). It trims an over-sized file selection at pick time and explains what it dropped, rather than letting the server reject the whole save later — the failure surfaces where the mistake was made.

## Product reviews

- `ReviewSection` finds "my review" by comparing `review.user` against the signed-in user's id from `authStore` inside the fetched review list — no separate "get my review" endpoint. Simpler request surface for a per-product review count that's realistically always small.
- `StarRating` renders half-star precision (a clipped `overflow-hidden` wrapper at `fill * 100%` width over an outline star) rather than rounding a 4.3 average down to a blunt 4 or up to 5 — small detail, but a rounded-off average is the kind of thing that reads as sloppy once you notice it.
- Product cards only render the rating row when `reviewCount > 0` — with every product starting at zero reviews, showing "No reviews yet" on all 15 cards at once would be more noise than signal. The detail page's larger `StarRating` does show "No reviews yet" since it's one product in focus, not a repeated line down a grid.

## Responsive approach

- Mobile-first Tailwind breakpoints (`sm/md/lg/xl`), a product grid that goes 1 → 2 → 3 → 4 columns, a slide-in `MobileNav` below `md` instead of trying to cram the desktop nav into a small viewport, and a cart summary that sits inline on mobile vs. a sticky side column on `lg+`.

## Testing strategy

- Vitest + Testing Library focused on `VariantSelector`, the one component with real interactive logic (merging a selection, disabling out-of-stock options) worth locking down with a test. Most of the rest of the UI is composition of typed API responses into markup, where the more valuable check is the manual/browser verification pass (see the implementation plan) rather than shallow render-assertion tests that mostly re-state the JSX.
