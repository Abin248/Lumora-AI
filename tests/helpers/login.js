export async function login(page) {

  const EMAIL = "abinr@gmail.com";
  const PASSWORD = "abin@123";

  await page.goto('/login');

  await page.waitForSelector('input[type="email"]');

  await page.fill('input[type="email"]', EMAIL);

  await page.fill('input[type="password"]', PASSWORD);

  await page.click('button[type="submit"]');

  await page.waitForURL(/welcome/, { timeout: 60000 });

}