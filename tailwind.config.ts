import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Palatino Linotype', 'Palatino', 'Times New Roman', 'serif'],
        brand: ['Cinzel', 'Palatino Linotype', 'Palatino', 'Times New Roman', 'serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        beige: 'rgb(var(--beige) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
      },
      fontSize: {
        display: ['4.5rem', { lineHeight: '1.05', letterSpacing: '0.02em' }],
        headline: ['2.5rem', { lineHeight: '1.2', letterSpacing: '0.025em' }],
        title: ['1.5rem', { lineHeight: '1.3', letterSpacing: '0.03em' }],
        body: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        caption: ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        micro: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        grid: '1.5rem',
        section: '4rem',
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;
