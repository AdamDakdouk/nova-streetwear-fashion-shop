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
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "drawer-in": {
          "0%": { opacity: "0", transform: "translateX(1.5rem)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "drawer-out": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(1.5rem)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        // Drawer enter/exit. Animations rather than transitions: an animation
        // starts on its own when the element mounts, where a transition needs a
        // class to flip on a later frame — which silently never happens if
        // frames are starved, leaving the drawer mounted but invisible.
        "fade-in-fast": "fade-in 0.26s ease-out both",
        "fade-out-fast": "fade-out 0.26s ease-in both",
        "drawer-in": "drawer-in 0.26s cubic-bezier(0.16, 1, 0.3, 1) both",
        "drawer-out": "drawer-out 0.26s cubic-bezier(0.7, 0, 0.84, 0) both",
      },
    },
  },
  plugins: [],
};
