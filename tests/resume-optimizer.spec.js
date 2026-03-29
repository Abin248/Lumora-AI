import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test('Optimize resume button works', async ({ page }) => {

  await login(page);

  await page.goto('/upload');

  await page.waitForTimeout(3000);

  const optimizeBtn = page.locator('button:has-text("Optimize")');

  if (await optimizeBtn.count() > 0) {
    await optimizeBtn.click();

    await page.waitForTimeout(5000);

    await expect(page.locator('body')).toContainText('Optimizing');
  }

});