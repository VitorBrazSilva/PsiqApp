import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --mode e2e --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
