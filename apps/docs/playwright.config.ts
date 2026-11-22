import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4174/querry-kit/',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'mkdir -p .output/pages-test/querry-kit && cp -R .output/public/. .output/pages-test/querry-kit/ && pnpm exec serve .output/pages-test -l tcp://127.0.0.1:4174',
    cwd: '.',
    url: 'http://127.0.0.1:4174/querry-kit/',
    reuseExistingServer: false,
  },
});
