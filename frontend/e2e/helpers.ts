import { expect, type Page } from '@playwright/test';

/** Mirrors backend/test/ui-server.ts UI_SEED. */
export const SEED = {
  admin: { email: 'admin@ui-test.tablenest', password: 'AdminPass123' },
  owner: { email: 'owner@ui-test.tablenest', password: 'OwnerPass123' },
  restaurant: 'Umuganda Kitchen',
  dish: 'Brochette platter',
};

/** Hermetic runs: anything not served by the local frontend/API (e.g. font CDNs) is aborted. */
export async function localOnly(page: Page) {
  await page.route(/^https?:\/\/(?!localhost[:/]|127\.0\.0\.1[:/])/, (route) => route.abort());
}

/** Returning visitor: welcome already seen and a persona chosen, so no overlays interrupt. */
export async function asReturningVisitor(page: Page) {
  await localOnly(page);
  await page.addInitScript(() => {
    sessionStorage.setItem('tn.welcome', '1');
    localStorage.setItem('tn.experience', JSON.stringify({ state: { persona: 'customer' }, version: 0 }));
  });
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).not.toHaveURL(/\/login/);
}

export const uniqueEmail = (tag: string) => `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@ui-test.tablenest`;
