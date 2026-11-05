import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Aranya Sentinel Specification Tokens (Hex Targets) */
        canopy: {
          950: "#183C2D",
          900: "#1F4A38",
          800: "#28513D",
          700: "#366850",
          600: "#447F63",
          DEFAULT: "#183C2D",
        },
        moss: {
          600: "#52765C",
          500: "#6B9276",
          200: "#C8DACB",
          100: "#E6EDE3",
          50: "#F2F6F0",
          DEFAULT: "#52765C",
        },
        paper: {
          100: "#F4F1E7",
          200: "#ECE7DA",
          DEFAULT: "#F4F1E7",
        },
        bone: {
          50: "#FFFEF8",
          100: "#FAF7EE",
          DEFAULT: "#FFFEF8",
        },
        sand: {
          200: "#E7E1D3",
          300: "#DDD6C4",
          DEFAULT: "#E7E1D3",
        },
        ink: {
          900: "#202923",
          800: "#36413A",
          600: "#59645C",
          400: "#86928A",
          DEFAULT: "#202923",
        },
        signal: {
          DEFAULT: "#C96C3D",
          hover: "#B85D30",
          soft: "#F8ECE5",
        },
        critical: {
          DEFAULT: "#B94236",
          hover: "#A3352B",
          soft: "#F9ECEB",
        },
        water: {
          DEFAULT: "#587B8B",
          soft: "#E8F0F3",
        },

        /* Semantic Aliases */
        canvas: "#F4F1E7",
        card: "#FFFEF8",
        rule: "#E7E1D3",
      },
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        sans: ["'Manrope'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        control: "8px",
        card: "12px",
        panel: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(32, 41, 35, 0.04), 0 1px 2px rgba(32, 41, 35, 0.02)",
        lift: "0 4px 20px -2px rgba(24, 60, 45, 0.08), 0 2px 6px -1px rgba(24, 60, 45, 0.04)",
        dialog: "0 12px 32px -4px rgba(24, 60, 45, 0.16), 0 4px 12px -2px rgba(24, 60, 45, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
