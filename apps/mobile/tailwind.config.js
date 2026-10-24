/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#08090b",
        card: "#121316",
        surface: "#17181c",
        "surface-inset": "rgba(255, 255, 255, 0.035)",
        foreground: "#f4f4f2",
        "muted-foreground": "#8a8c92",
        "subtle-foreground": "#5f6065",
        border: "rgba(255, 255, 255, 0.07)",
        "border-subtle": "rgba(255, 255, 255, 0.04)",
        mineral: {
          emerald: "#a9bfa9",
          "emerald-tint": "rgba(169, 191, 169, 0.12)",
          crimson: "#c99a90",
          "crimson-tint": "rgba(194, 133, 123, 0.13)",
          amber: "#d2bd93",
          "amber-tint": "rgba(210, 189, 147, 0.12)",
          blue: "#a6b0bd",
          "blue-tint": "rgba(166, 176, 189, 0.12)",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
