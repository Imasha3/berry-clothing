import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        berry: {
          50: "#fff4f7",
          100: "#ffe7ee",
          200: "#ffc8d6",
          300: "#ff9fb8",
          400: "#ff6f98",
          500: "#f34078",
          600: "#d9225d",
          700: "#b61649",
          800: "#92163e",
          900: "#781639"
        },
        sand: "#f3ece5",
        ink: "#171212"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 18, 18, 0.08)"
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(243, 64, 120, 0.18), transparent 42%), linear-gradient(135deg, #fff7f5, #ffffff 45%, #f7ede7 100%)"
      }
    }
  },
  plugins: []
};

export default config;
