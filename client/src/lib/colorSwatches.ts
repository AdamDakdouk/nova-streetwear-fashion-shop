/**
 * Maps a variant "Color" option's display value to a swatch color. Covers every
 * color used in the current seed catalog; falls back to a neutral dot for
 * anything unmapped rather than breaking.
 */
const COLOR_MAP: Record<string, string> = {
  blue: "#2C4A7C",
  "olive oil": "#6B6B3A",
  olive: "#6B6B3A",
  black: "#18181B",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  "washed black": "#3F3F46",
  beige: "#D9C7A7",
  white: "#F4F4F5",
  reddish: "#B84C3E",
  red: "#B84C3E",
  pink: "#E8A0BF",
  green: "#4B7A4B",
  brown: "#7A5230",
  navy: "#1E2A4A",
};

export function getSwatchColor(value: string): string {
  return COLOR_MAP[value.trim().toLowerCase()] ?? "#A1A1AA";
}
