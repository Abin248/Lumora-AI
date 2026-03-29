import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test('Dashboard navigation works', async ({ page }) => {

  await login(page);

  await page.goto('/dashboard');

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL(/dashboard/);

  await expect(page.locator('body')).toContainText('Resume');

});