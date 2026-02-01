import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't clear dist folder (shared with other builds)
    rollupOptions: {
      input: 'src/menu-conditions-main.ts',
      output: {
        entryFileNames: 'menu-conditions.js',
        assetFileNames: '[name][extname]',
        format: 'es'
      }
    }
  }
});
