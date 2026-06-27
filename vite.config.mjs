import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'builds/web',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000
  }
});
