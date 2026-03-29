// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 60000,

  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],

  reporter: [['html', { open: 'never' }]],
});