import { expect, test } from '@playwright/test';
import { asReturningVisitor, SEED, signIn } from './helpers';

test.beforeEach(async ({ page }) => asReturningVisitor(page));

test('owner dashboard pages load real data', async ({ page }) => {
  await signIn(page, SEED.owner.email, SEED.owner.password);
  await expect(page.getByText(SEED.restaurant).first()).toBeVisible();
  await expect(page.getByText("Today's sales")).toBeVisible();

  await page.goto('/owner/menu');
  await expect(page.getByText(SEED.dish)).toBeVisible();

  await page.goto('/owner/tables');
  await expect(page.getByText('3 tables · 12 seats', { exact: false })).toBeVisible();

  await page.goto('/owner/qrcodes');
  await expect(page.getByRole('img', { name: 'QR code for table 1' })).toBeVisible();

  await page.goto('/owner/billing');
  await expect(page.getByRole('heading', { name: 'Your plan' })).toBeVisible();

  await page.goto('/owner/analytics');
  await expect(page.getByText('Sales by day')).toBeVisible();
});

test('owner can add a dish and it appears on the public menu', async ({ page }) => {
  await signIn(page, SEED.owner.email, SEED.owner.password);
  await page.goto('/owner/menu');
  await page.getByRole('button', { name: 'Add dish' }).click();
  const name = `Ugali ${Date.now() % 10000}`;
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await page.getByLabel('Price').fill('6.5');
  await page.getByRole('button', { name: 'Add to menu' }).click();
  await expect(page.getByText(name)).toBeVisible();

  await page.goto('/restaurants');
  await page.getByRole('link', { name: new RegExp(SEED.restaurant) }).first().click();
  await expect(page.getByText(name)).toBeVisible();
});

test('admin sees the platform and cannot be reached by an owner', async ({ page, browser }) => {
  await signIn(page, SEED.admin.email, SEED.admin.password);
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByText('Our revenue this month')).toBeVisible();
  await page.goto('/admin/restaurants');
  await expect(page.getByText(SEED.restaurant)).toBeVisible();
  await page.goto('/admin/audit');
  await expect(page.getByText(/Restaurant status|restaurant/i).first()).toBeVisible();

  const ctx = await browser.newContext();
  const owner = await ctx.newPage();
  await asReturningVisitor(owner);
  await signIn(owner, SEED.owner.email, SEED.owner.password);
  await owner.goto('/admin');
  await expect(owner).not.toHaveURL(/\/admin$/);
  await ctx.close();
});
