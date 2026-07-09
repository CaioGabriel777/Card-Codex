import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0C10',
          inset: '#12151c',
          'surface-2': '#14181f',
          surface: '#1F2833',
          'surface-3': '#2a3442',
          gold: '#C9A24B',
          blue: '#3AB0FF',
          text: '#E8E6E1',
          'text-dim': '#8a8780',
          red: '#8B2E2E',
          border: '#1F2833',
          'border-subtle': 'rgba(232,230,225,0.08)',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Public Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
