import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.ts',
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: '[name][extname]',
        format: 'es',
        manualChunks(id) {
          // Separate shared dependencies into their own chunks so lazy-loaded
          // chunks never import from the entry point (main.js). WordPress adds
          // ?ver= to the entry URL, making it a different module identity from
          // the bare ../main.js path that chunks would otherwise reference.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/src/lib/')) {
            return 'shared';
          }
        }
      }
    }
  }
});
