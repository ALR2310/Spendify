import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import pkg from './package.json' with { type: 'json' };

config({ quiet: true });

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.VITE_PORT || 2310;

export default defineConfig({
  build: {
    sourcemap: isDev,
    minify: !isDev,
    cssMinify: !isDev,
    emptyOutDir: true,
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      external: ['jeep-sqlite'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor_react';
          }
        },
      },
    },
  },
  server: {
    port: Number(port),
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  clearScreen: false,
  plugins: [
    react(),
    tailwindcss(),
    analyzer({
      openAnalyzer: false,
      analyzerMode: 'static',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'src/assets/sql-wasm.wasm',
          dest: 'assets',
        },
      ],
    }),
  ],
});
