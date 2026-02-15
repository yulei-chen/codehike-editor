import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  base: '/',
  build: {
    outDir: resolve(__dirname, '../../dist/editor'),
    emptyOutDir: true
  },
  server: {
    port: 4321,
    proxy: {
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  css: {
    postcss: {
      plugins: [
        (await import('tailwindcss')).default({
          config: resolve(__dirname, 'tailwind.config.ts')
        }),
        (await import('autoprefixer')).default
      ]
    }
  }
});
