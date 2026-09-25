import { expect, test, type Page } from '@playwright/test';
import { asReturningVisitor, SEED, signIn, uniqueEmail } from './helpers';

async function register(page: Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('Full name').fill('Bea Booker');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('BookerPass123');
  await page.getByRole('button', { name: /create account|sign up|join/i }).click();
  await expect(page).toHaveURL(/\/home/);
}

test('guest requests a table and the restaurant confirms it', async ({ browser }) => {
  const guestCtx = await browser.newContext();
  const guest = await guestCtx.newPage();
  await asReturningVisitor(guest);
  await register(guest, uniqueEmail('booker'));

  await guest.goto('/restaurants');
  await guest.getByRole('link', { name: new RegExp(SEED.restaurant) }).first().click();
  await guest.getByRole('tab', { name: 'Book a table' }).click();

  // Tomorrow, party of 2 (the default), first free time.
  const when = guest.locator('section', { has: guest.getByRole('heading', { name: 'When?' }) });
  await when.getByRole('button').nth(1).click();
  const times = guest.locator('section', { has: guest.getByRole('heading', { name: 'What time?' }) });
  const firstFree = times.locator('button:not([disabled])').first();
  await expect(firstFree).toBeVisible();
  const chosen = (await firstFree.textContent())?.trim();
  await firstFree.click();
  await guest.getByRole('button', { name: `Request ${chosen}` }).click();
  await expect(guest.getByText('Reserved', { exact: true })).toBeVisible();

  // The restaurant sees the request and confirms it.
  const ownerCtx = await browser.newContext();
  const owner = await ownerCtx.newPage();
  await asReturningVisitor(owner);
  await signIn(owner, SEED.owner.email, SEED.owner.password);
  await owner.goto('/owner/reservations');
  await owner.getByRole('tab', { name: 'All upcoming' }).click();
  const row = owner.locator('li', { hasText: 'Bea Booker' }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: 'Confirm' }).click();
  await expect(row.getByText('Confirmed').filter({ visible: true })).toBeVisible();

  // The guest's bookings page reflects it.
  await guest.goto('/my-bookings');
  await expect(guest.getByText(SEED.restaurant).first()).toBeVisible();
  await expect(guest.getByText('Confirmed').first()).toBeVisible();

  await guestCtx.close();
  await ownerCtx.close();
});

test('the same slot cannot be double-booked from the UI', async ({ browser }) => {
  // Two guests race for the last table of 6 (the seed has exactly one 6-top).
  const pages: Page[] = [];
  for (const tag of ['racer-a', 'racer-b']) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await asReturningVisitor(p);
    await register(p, uniqueEmail(tag));
    await p.goto('/restaurants');
    await p.getByRole('link', { name: new RegExp(SEED.restaurant) }).first().click();
    await p.getByRole('tab', { name: 'Book a table' }).click();
    const when = p.locator('section', { has: p.getByRole('heading', { name: 'When?' }) });
    await when.getByRole('button').nth(2).click();
    // Party of 6: only table 3 fits.
    const party = p.getByRole('group', { name: 'Guests' });
    for (let i = 0; i < 4; i++) await party.getByRole('button', { name: 'Increase' }).click();
    await expect(party).toContainText('6');
    pages.push(p);
  }
  const pickSame = async (p: Page) => {
    const times = p.locator('section', { has: p.getByRole('heading', { name: 'What time?' }) });
    const slot = times.locator('button:not([disabled])').last();
    const label = (await slot.textContent())!.trim();
    await slot.click();
    return label;
  };
  const a = await pickSame(pages[0]);
  const b = await pickSame(pages[1]);
  expect(a).toBe(b);

  await Promise.all(pages.map((p) => p.getByRole('button', { name: `Request ${a}` }).click()));
  const reserved = await Promise.all(
    pages.map((p) =>
      p
        .getByText('Reserved', { exact: true })
        .waitFor({ timeout: 8000 })
        .then(() => true)
        .catch(() => false),
    ),
  );
  expect(reserved.filter(Boolean)).toHaveLength(1);
  const loser = pages[reserved.indexOf(false)];
  await expect(loser.getByText(/no longer available|just been taken|no table|fully booked/i)).toBeVisible();
});
