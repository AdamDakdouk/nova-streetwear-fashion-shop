import type { VariantAxisSummary } from "../types";

export function findAxis<T extends { name: string }>(variants: T[], name: string): T | undefined {
  return variants.find((axis) => axis.name === name);
}

export function formatSizeList(variants: VariantAxisSummary[]): string | null {
  const sizeAxis = findAxis(variants, "Size");
  if (!sizeAxis || sizeAxis.options.length === 0) return null;
  return sizeAxis.options.map((o) => o.value).join(" · ");
}
