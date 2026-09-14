import { Link } from "react-router-dom";
import { formatCurrency } from "../../lib/formatCurrency";
import { findAxis, formatSizeList } from "../../lib/variantDisplay";
import { ColorSwatchDots } from "./ColorSwatchDots";
import type { ProductSummary } from "../../types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const colorAxis = findAxis(product.variants, "Color");
  const colors = colorAxis?.options.map((o) => o.value) ?? [];
  const sizeList = formatSizeList(product.variants);

  return (
    <Link
      to={`/products/${product._id}`}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-popover"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-background">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-heading text-sm font-semibold leading-snug text-ink">{product.title}</h3>

        {colors.length > 0 && <ColorSwatchDots colors={colors} />}
        {sizeList && <p className="text-xs tracking-wide text-muted">{sizeList}</p>}

        <p className="mt-auto pt-2 text-sm font-semibold tabular-nums text-ink">
          {formatCurrency(product.price)}
        </p>
      </div>
    </Link>
  );
}
