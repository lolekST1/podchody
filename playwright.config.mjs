import { defineConfig, devices } from '@playwright/test';

const PORT = 8123;
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/przygotuj.mjs',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'raport/html', open: 'never' }]],
  use: {
    ...devices['Pixel 7'],
    baseURL: `http://localhost:${PORT}/`,
    locale: 'pl-PL',
    trace: 'retain-on-failure',
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: `node scripts/serwer.mjs`,
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
  },
});
