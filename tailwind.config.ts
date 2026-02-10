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
          DEFAULT: '#111111', // Deep Black for primary actions
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F9F9F9', // Off-white
          foreground: '#111111',
        },
        accent: {
          DEFAULT: '#F9F9F9',
          foreground: '#111111',
        },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#111111',
        // Epidemic Sound style functional colors
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
