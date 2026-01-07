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
        obsidian: '#0D0D0D',
        charcoal: '#1A1A1A',
        slate: '#2D2D2D',
        gold: {
          DEFAULT: '#C9A227',
          hover: '#D4AF37',
          dim: 'rgba(201,162,39,0.15)'
        },
        cream: '#F5F0E6',
        silver: '#9CA3AF',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
