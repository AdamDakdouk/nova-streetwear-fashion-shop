import { getSwatchColor } from "../../lib/colorSwatches";

interface ColorSwatchDotsProps {
  colors: string[];
  max?: number;
}

/** Small read-only row of color dots, used on product cards. */
export function ColorSwatchDots({ colors, max = 5 }: ColorSwatchDotsProps) {
  if (colors.length === 0) return null;

  const visible = colors.slice(0, max);
  const overflow = colors.length - visible.length;

  return (
    <div className="flex items-center gap-1.5" aria-label={`${colors.length} colors available`}>
      {visible.map((color) => (
        <span
          key={color}
          title={color}
          className="h-3.5 w-3.5 rounded-full border border-black/10"
          style={{ backgroundColor: getSwatchColor(color) }}
        />
      ))}
      {overflow > 0 && <span className="text-xs text-muted">+{overflow}</span>}
    </div>
  );
}
