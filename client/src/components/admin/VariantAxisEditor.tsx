import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import type { VariantAxis, VariantOption } from "../../types";

interface VariantAxisEditorProps {
  variants: VariantAxis[];
  onChange: (next: VariantAxis[]) => void;
}

const inputClass = "focus-ring h-9 rounded-md border border-border px-2 text-sm";

export function VariantAxisEditor({ variants, onChange }: VariantAxisEditorProps) {
  function updateAxis(index: number, patch: Partial<VariantAxis>) {
    onChange(variants.map((axis, i) => (i === index ? { ...axis, ...patch } : axis)));
  }

  function updateOption(axisIndex: number, optionIndex: number, patch: Partial<VariantOption>) {
    const axis = variants[axisIndex];
    const options = axis.options.map((opt, i) => (i === optionIndex ? { ...opt, ...patch } : opt));
    updateAxis(axisIndex, { options });
  }

  function addAxis() {
    onChange([...variants, { name: "", options: [{ value: "", stock: 0 }] }]);
  }

  function removeAxis(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function addOption(axisIndex: number) {
    const axis = variants[axisIndex];
    updateAxis(axisIndex, { options: [...axis.options, { value: "", stock: 0 }] });
  }

  function removeOption(axisIndex: number, optionIndex: number) {
    const axis = variants[axisIndex];
    updateAxis(axisIndex, { options: axis.options.filter((_, i) => i !== optionIndex) });
  }

  return (
    <div className="flex flex-col gap-4">
      {variants.map((axis, axisIndex) => {
        const isColor = axis.name.trim().toLowerCase() === "color";
        return (
          <div key={axisIndex} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <input
                value={axis.name}
                onChange={(e) => updateAxis(axisIndex, { name: e.target.value })}
                placeholder="Axis name (e.g. Color, Size)"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeAxis(axisIndex)}
                aria-label="Remove variant axis"
                className="focus-ring flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted hover:bg-danger/5 hover:text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {axis.options.map((option, optionIndex) => (
                <div key={optionIndex} className="rounded-md bg-background p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={option.value}
                      onChange={(e) => updateOption(axisIndex, optionIndex, { value: e.target.value })}
                      placeholder="Value (e.g. Blue, M)"
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={option.stock}
                      onChange={(e) =>
                        updateOption(axisIndex, optionIndex, { stock: Math.max(0, Number(e.target.value)) })
                      }
                      placeholder="Stock"
                      className={`${inputClass} w-24`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(axisIndex, optionIndex)}
                      aria-label="Remove option"
                      className="focus-ring flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted hover:bg-danger/5 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {isColor && (
                    <div className="mt-3">
                      <ImageUploader
                        label={`Photos for "${option.value || "this color"}"`}
                        images={option.images ?? []}
                        onChange={(images) => updateOption(axisIndex, optionIndex, { images })}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOption(axisIndex)}
                className="focus-ring inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:text-accent-hover"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add option
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addAxis}
        className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 text-sm font-medium text-muted hover:border-ink hover:text-ink"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add variant axis
      </button>
    </div>
  );
}
