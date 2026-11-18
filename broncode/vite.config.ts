import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' zodat de build overal werkt: GitHub Pages, een submap of lokaal.
export default defineConfig({
  base: './',
  // De build komt in de hoofdmap van de repo (één map omhoog), zodat GitHub Pages hem direct toont.
  build: { outDir: '..', emptyOutDir: false },
  plugins: [react()],
  test: { include: ['src/**/*.test.ts'] },
} as never);
