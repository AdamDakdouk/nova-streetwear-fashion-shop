/**
 * The hero exactly as it was hardcoded in the frontend before it became
 * admin-editable. Single source of truth for two consumers: the seed (which
 * writes it into the DB so a hero always exists from first boot) and
 * `GET /site-content/hero` (which falls back to it if the document is somehow
 * missing, so the storefront can never render a blank hero).
 */
export const DEFAULT_HERO = {
  eyebrow: "New Season",
  heading: "Layer up for\ncooler days",
  subcopy: "Jackets, hoodies, and everyday essentials built for the street — not the runway.",
  ctaLabel: "Shop New Arrivals",
  images: ["/products/bomber-jacket/bomber-jacket-olive-on-model.jpg"],
};
