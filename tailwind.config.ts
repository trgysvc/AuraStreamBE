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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#F97316',
          dark: '#c2410c',
        },
        secondary: {
          DEFAULT: '#10b981',
        },
        frequency: {
          440: '#8b5cf6',
          432: '#10b981',
          528: '#0ea5e9',
        },
        status: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
};
export default config;
