import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}

export function QuantityStepper({ value, min = 1, max, onChange, disabled }: QuantityStepperProps) {
  return (
    <div className="inline-flex h-11 items-center rounded-md border border-border">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="focus-ring flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="focus-ring flex h-11 w-11 items-center justify-center text-ink disabled:opacity-30"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
