import { expect, test } from '@playwright/test';
import { asReturningVisitor, SEED } from './helpers';

test.beforeEach(async ({ page }) => asReturningVisitor(page));

test('phone layout: no sideways scroll, tab bar navigation, restaurant page usable', async ({ page }) => {
  for (const path of ['/', '/restaurants', '/partner', '/help', '/login', '/register']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
  }

  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: /discover|explore|restaurants/i }).last().click();
  await expect(page).toHaveURL(/\/restaurants/);
  await page.getByRole('link', { name: new RegExp(SEED.restaurant) }).first().click();
  await page.getByRole('button', { name: `Add ${SEED.dish}` }).click();
  await page.getByRole('button', { name: /View bag/ }).click();
  await expect(page.getByRole('button', { name: /checkout/i }).first()).toBeVisible();
});
