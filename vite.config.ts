import { resolve } from 'path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import svg from 'vite-plugin-solid-svg';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  server: {
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  root: 'frontend',
  build: {
    target: ['es2019', 'chrome86', 'safari13'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  plugins: [
    vanillaExtractPlugin({
      // Revert when vanilla-extract-css/vanilla-extract#1195 merges
      identifiers: 'short',
    }),
    svg({
      svgo: {
        enabled: false,
      },
    }),
    solid(),
  ],

  resolve: {
    alias: [
      { find: /^@\//, replacement: `${resolve(__dirname, 'frontend/src')}/` },
    ],
  },
});
