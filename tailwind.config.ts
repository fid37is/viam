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
        primary: {
          DEFAULT: "#00e0ff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#ff304f",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#74f9ff",
          foreground: "#000000",
        },
      },
    },
  },
  plugins: [],
};

export default config;