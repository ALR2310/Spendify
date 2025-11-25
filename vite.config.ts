import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { analyzer } from 'vite-bundle-analyzer';
import { config } from 'dotenv';
import pkg from './package.json' with { type: 'json' };
import { viteStaticCopy } from 'vite-plugin-static-copy';

config({ quiet: true });

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.VITE_PORT || 2310;
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  build: {
    sourcemap: isDev,
    minify: !isDev,
    cssMinify: !isDev,
    emptyOutDir: true,
    outDir: path.resolve('..', 'dist'),
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
    host: host || false,
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
    VITE_APP_VERSION: JSON.stringify(pkg.version),
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
        // {
        //   src: 'node_modules/',
        //   dest: 'assets',
        // },
      ],
    }),
  ],
});
