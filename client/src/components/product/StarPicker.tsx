import { useState } from "react";
import { Star } from "lucide-react";

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${star <= display ? "text-accent" : "text-border"}`}
            fill={star <= display ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
