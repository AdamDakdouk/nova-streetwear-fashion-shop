import { ArrowDown } from "lucide-react";

interface HeroBannerProps {
  onShopClick: () => void;
}

export function HeroBanner({ onShopClick }: HeroBannerProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-light via-background to-background">
      <div className="grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">New Season</p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
            Layer up for
            <br />
            cooler days
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
            Jackets, hoodies, and everyday essentials built for the street — not the runway.
          </p>
          <button
            onClick={onShopClick}
            className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal"
          >
            Shop New Arrivals
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-2xl shadow-popover lg:max-w-sm">
          <img
            src="/products/bomber-jacket/bomber-jacket-olive-on-model.jpg"
            alt="Model wearing the NOVA Bomber Jacket in olive"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
