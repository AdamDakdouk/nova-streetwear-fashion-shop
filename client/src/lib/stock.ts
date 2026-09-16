import type { VariantAxis, VariantSelection } from "../types";

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
