import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test('User can upload resume', async ({ page }) => {

  await login(page);

  await page.goto('/upload');

  await page.waitForSelector('input[type="file"]');

  const fileInput = page.locator('input[type="file"]');

  await fileInput.setInputFiles('tests/sample-resume.pdf');

  const jobDescription = page.locator('textarea');

  await jobDescription.fill(
    'Looking for React developer with Node.js and MongoDB experience'
  );

  await page.click('button:has-text("Upload")');

  await page.waitForTimeout(5000);

});