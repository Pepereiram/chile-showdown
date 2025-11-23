import {Page} from '@playwright/test';

export const login = async (page: Page, username: string, password: string) => {
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}