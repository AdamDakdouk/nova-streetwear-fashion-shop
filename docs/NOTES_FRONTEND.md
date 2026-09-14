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

## Responsive approach

- Mobile-first Tailwind breakpoints (`sm/md/lg/xl`), a product grid that goes 1 → 2 → 3 → 4 columns, a slide-in `MobileNav` below `md` instead of trying to cram the desktop nav into a small viewport, and a cart summary that sits inline on mobile vs. a sticky side column on `lg+`.

## Testing strategy

- Vitest + Testing Library focused on `VariantSelector`, the one component with real interactive logic (merging a selection, disabling out-of-stock options) worth locking down with a test. Most of the rest of the UI is composition of typed API responses into markup, where the more valuable check is the manual/browser verification pass (see the implementation plan) rather than shallow render-assertion tests that mostly re-state the JSX.
