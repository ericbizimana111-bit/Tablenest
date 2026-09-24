/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// In development the frontend proxies /api and /uploads to the NestJS API, so the browser talks to
// one origin. In production, serve the built files and the API behind the same domain (or set
// VITE_API_URL at build time).
const apiTarget = process.env.API_PROXY_TARGET || 'http://localhost:3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: Number(process.env.PORT || 5173),
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/uploads': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});
