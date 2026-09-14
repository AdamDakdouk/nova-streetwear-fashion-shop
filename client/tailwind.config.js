/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F3F0E9",
        surface: "#FFFFFF",
        ink: "#18181B",
        charcoal: "#27272A",
        muted: "#78716C",
        border: "#E2DDD1",
        accent: {
          DEFAULT: "#C2410C",
          hover: "#9A3412",
          light: "#FFEDD5",
        },
        success: "#16A34A",
        danger: "#DC2626",
      },
      fontFamily: {
        heading: ["Sora", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        popover: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
