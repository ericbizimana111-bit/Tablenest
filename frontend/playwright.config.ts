import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests drive the real frontend against the real API.
 * The API runs on a throwaway in-memory MongoDB (backend/test/ui-server.ts) seeded with one
 * approved restaurant; nothing ever touches a development or production database.
 */
const API_PORT = 3101;
const WEB_PORT = 5174;
// Use an installed browser (e.g. PW_CHANNEL=msedge or chrome) when Playwright's own build can't be downloaded.
const channel = process.env.PW_CHANNEL || undefined;

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel }, testIgnore: /mobile\.spec/ },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel }, testMatch: /mobile\.spec/ },
  ],
  webServer: [
    {
      command: 'npx ts-node -P test/tsconfig.json test/ui-server.ts',
      cwd: '../backend',
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      env: { UI_TEST_PORT: String(API_PORT) },
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: 'pipe',
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      env: { API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}` },
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
