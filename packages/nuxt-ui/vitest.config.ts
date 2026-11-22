import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '#app': fileURLToPath(new URL('./test/nuxt-app.ts', import.meta.url)) } },
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/runtime/**/*.{ts,vue}'],
      thresholds: { lines: 100, statements: 100, branches: 80, functions: 50 },
    },
  },
});
