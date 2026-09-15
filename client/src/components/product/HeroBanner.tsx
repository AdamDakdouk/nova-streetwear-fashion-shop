import { ArrowDown } from "lucide-react";
import type { HeroContent } from "../../types";

interface HeroBannerProps {
  hero: HeroContent;
  onShopClick: () => void;
}

/** Mirrors the server-side cap — extra images are ignored rather than breaking the layout. */
const MAX_IMAGES = 4;

function HeroImages({ images }: { images: string[] }) {
  const shown = images.slice(0, MAX_IMAGES);

  // One image keeps the original single-portrait treatment. Two or more get
  // arranged into a tighter collage so the block stays the same visual weight
  // instead of sprawling as images are added.
  if (shown.length === 1) {
    return (
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-2xl bg-black/5 shadow-popover lg:max-w-sm">
        <img src={shown[0]} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  if (shown.length === 2) {
    return (
      <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 gap-3 lg:max-w-md">
        {shown.map((src) => (
          <div key={src} className="aspect-[3/4] overflow-hidden rounded-xl bg-black/5">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // Three: one full-height feature image beside two stacked squares.
  if (shown.length === 3) {
    return (
      <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 grid-rows-2 gap-3 lg:max-w-md">
        <div className="row-span-2 h-full overflow-hidden rounded-xl bg-black/5">
          <img src={shown[0]} alt="" className="h-full w-full object-cover" />
        </div>
        {shown.slice(1).map((src) => (
          <div key={src} className="aspect-square overflow-hidden rounded-xl bg-black/5">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 gap-3 lg:max-w-md">
      {shown.map((src) => (
        <div key={src} className="aspect-square overflow-hidden rounded-xl bg-black/5">
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

export function HeroBanner({ hero, onShopClick }: HeroBannerProps) {
  const headingLines = hero.heading.split("\n");

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-accent-light via-background to-background">
      <div className="grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{hero.eyebrow}</p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
            {headingLines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted sm:text-base">{hero.subcopy}</p>
          <button
            onClick={onShopClick}
            className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-charcoal"
          >
            {hero.ctaLabel}
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <HeroImages images={hero.images} />
      </div>
    </section>
  );
}
