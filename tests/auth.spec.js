import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test.skip('User registration works', async ({ page }) => {

  await page.goto('/register');

  await page.fill('input[name="name"]', 'Playwright User');

  await page.fill('input[type="email"]', 'playwrighttest@gmail.com');

  await page.fill('input[type="password"]', 'password123');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);

});

test('User login works', async ({ page }) => {

  await login(page);

  await expect(page).toHaveURL(/welcome/);

});