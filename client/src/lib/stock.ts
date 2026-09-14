import type { VariantAxis, VariantSelection } from "../types";

/**
 * Mirrors the server's stock resolution rule (see server/src/services/cart.service.ts)
 * so the UI can disable/clamp controls before round-tripping to the API. The server
 * remains the source of truth and re-validates on every mutation.
 */
export function resolveAvailableStock(
  variants: VariantAxis[],
  baseStock: number,
  selection: VariantSelection
): number {
  if (variants.length === 0) return baseStock;

  let min = Infinity;
  for (const axis of variants) {
    const selectedValue = selection[axis.name];
    const option = axis.options.find((o) => o.value === selectedValue);
    if (!option) return 0;
    min = Math.min(min, option.stock);
  }
  return min === Infinity ? 0 : min;
}

export function isSelectionComplete(variants: VariantAxis[], selection: VariantSelection): boolean {
  return variants.every((axis) => Boolean(selection[axis.name]));
}
