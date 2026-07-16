import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      common: path.resolve(__dirname, 'common'),
      components: path.resolve(__dirname, 'components'),
      graphql: path.resolve(__dirname, 'graphql'),
      pages: path.resolve(__dirname, 'pages'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/.next/**', '**/node_modules/**'],
    restoreMocks: true,
  },
});
