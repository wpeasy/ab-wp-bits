import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/menu-queries-main.ts',
      output: {
        entryFileNames: 'menu-queries.js',
        assetFileNames: '[name][extname]',
        format: 'iife',
        name: 'ABMenuQueries'
      }
    }
  }
});
