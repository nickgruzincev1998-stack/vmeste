import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#1a3a2a",
        moss:   "#2d5a3d",
        sage:   "#4a7c59",
        mint:   "#7ab893",
        cream:  "#f5f0e8",
        sand:   "#e8dfc8",
        bark:   "#8b6b4a",
        ember:  "#c4602a",
      },
      fontFamily: {
        unbounded: ["var(--font-unbounded)", "sans-serif"],
        golos:     ["var(--font-golos)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "float-slow":   "float 6s ease-in-out infinite",
        "float-medium": "float 4s ease-in-out infinite 1s",
        "float-fast":   "float 5s ease-in-out infinite 2s",
        "fade-up":      "fadeUp 0.6s ease forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-16px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
