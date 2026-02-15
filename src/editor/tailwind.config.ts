import type { Config } from 'tailwindcss';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  content: [
    `${__dirname}/index.html`,
    `${__dirname}/**/*.{js,ts,jsx,tsx}`
  ],
  theme: {
    extend: {
      colors: {
        'ch-bg': '#1e1e2e',
        'ch-surface': '#313244',
        'ch-border': '#45475a',
        'ch-text': '#cdd6f4',
        'ch-text-muted': '#a6adc8',
        'ch-accent': '#89b4fa',
        'ch-accent-hover': '#b4befe',
        'ch-success': '#a6e3a1',
        'ch-warning': '#f9e2af',
        'ch-error': '#f38ba8'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.1s ease-out'
      }
    }
  },
  plugins: []
} satisfies Config;
