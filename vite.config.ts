/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // CSS is left unprocessed: these tests assert behaviour and accessibility, which must hold
    // regardless of styling. Anything that depends on real layout (rail width, what is visible
    // at which breakpoint) is covered by the browser suite instead.
    css: false,
  },
});
