import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'app', testDir: './test', testIgnore: '**/crud.spec.ts' },
    { name: 'e2e', testDir: '../../tests/e2e' },
    // The write flow creates temporary records. Run the seeded read assertions first.
    { name: 'crud', testDir: './test', testMatch: '**/crud.spec.ts', dependencies: ['app', 'e2e'] },
  ],
  workers: 2,
  use: {
    baseURL: process.env.WORKBOARD_TEST_APP_URL ?? 'http://127.0.0.1:3201',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});
