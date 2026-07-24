import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Mono', 'Menlo', 'Monaco', 'monospace'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'monospace'],
        display: ['IBM Plex Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        paper: '#F5F0E8',
        beige: '#E8DFD0',
        surface: '#FFFEFB',
        ink: '#2C2A27',
        accent: '#8B7355',
        muted: '#6B6560',
        border: '#C8C2B8',
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'headline': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'micro': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
      },
      spacing: {
        'grid': '1.5rem',
        'section': '4rem',
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
