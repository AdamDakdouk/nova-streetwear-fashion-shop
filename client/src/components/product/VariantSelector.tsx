import { Check } from "lucide-react";
import { getSwatchColor } from "../../lib/colorSwatches";
import type { VariantAxis, VariantSelection } from "../../types";

interface VariantSelectorProps {
  axes: VariantAxis[];
  selection: VariantSelection;
  onChange: (next: VariantSelection) => void;
}

export function VariantSelector({ axes, selection, onChange }: VariantSelectorProps) {
  if (axes.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {axes.map((axis) => {
        const isColor = axis.name === "Color";
        const selectedValue = selection[axis.name];

        return (
          <div key={axis.name}>
            <p className="mb-2 text-sm font-medium text-ink">
              {axis.name}
              {selectedValue && <span className="ml-1.5 font-normal text-muted">{selectedValue}</span>}
            </p>

            {isColor ? (
              <div className="flex flex-wrap gap-2.5" role="group" aria-label={axis.name}>
                {axis.options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const isOutOfStock = option.stock === 0;
                  const swatch = getSwatchColor(option.value);
                  const isLight = ["#F4F4F5", "#D9C7A7"].includes(swatch);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={option.value}
                      aria-label={option.value}
                      aria-pressed={isSelected}
                      aria-disabled={isOutOfStock}
                      disabled={isOutOfStock}
                      onClick={() => onChange({ ...selection, [axis.name]: option.value })}
                      className={`focus-ring relative flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                        isOutOfStock ? "cursor-not-allowed opacity-40" : "hover:scale-105"
                      } ${isSelected ? "border-ink ring-2 ring-ink ring-offset-2 ring-offset-background" : "border-black/10"}`}
                      style={{ backgroundColor: swatch }}
                    >
                      {isSelected && (
                        <Check
                          className={`h-4 w-4 ${isLight ? "text-ink" : "text-white"}`}
                          aria-hidden="true"
                        />
                      )}
                      {isOutOfStock && (
                        <span className="absolute inset-0 rounded-full border border-black/20 [background:linear-gradient(to_top_right,transparent_calc(50%-1px),rgba(0,0,0,0.4),transparent_calc(50%+1px))]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label={axis.name}>
                {axis.options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  const isOutOfStock = option.stock === 0;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isSelected}
                      aria-disabled={isOutOfStock}
                      disabled={isOutOfStock}
                      onClick={() => onChange({ ...selection, [axis.name]: option.value })}
                      className={`focus-ring flex h-11 min-w-11 items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors ${
                        isOutOfStock
                          ? "cursor-not-allowed border-border text-muted line-through opacity-50"
                          : isSelected
                            ? "border-ink bg-ink text-white"
                            : "border-border bg-white text-ink hover:border-ink"
                      }`}
                    >
                      {option.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
