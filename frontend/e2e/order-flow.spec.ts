import { expect, test } from '@playwright/test';
import { asReturningVisitor, SEED, signIn, uniqueEmail } from './helpers';

test('guest orders for pickup, the kitchen accepts it, and the guest sees the update', async ({ browser }) => {
  // ── Guest ────────────────────────────────────────────────────────────────
  const guestCtx = await browser.newContext();
  const guest = await guestCtx.newPage();
  await asReturningVisitor(guest);

  await guest.goto('/restaurants');
  await guest.getByRole('link', { name: new RegExp(SEED.restaurant) }).first().click();
  await expect(guest.getByRole('heading', { name: SEED.restaurant })).toBeVisible();

  await guest.getByRole('button', { name: `Add ${SEED.dish}` }).click();
  await guest.getByRole('button', { name: /checkout/i }).first().click();

  // Not signed in: sent to sign in, then on to create an account, keeping the checkout destination.
  await expect(guest).toHaveURL(/\/login\?next=%2Fcheckout|\/login\?next=\/checkout/);
  await guest.getByRole('link', { name: 'Create a free account' }).click();
  await expect(guest).toHaveURL(/register\?next=/);
  await guest.getByLabel('Full name').fill('Grace Guest');
  await guest.getByLabel('Email').fill(uniqueEmail('guest'));
  await guest.getByLabel('Password', { exact: true }).fill('GuestPass123');
  await guest.getByRole('button', { name: /create account|sign up|join/i }).click();

  await expect(guest).toHaveURL(/\/checkout/);
  await guest.getByRole('button', { name: /Pickup/ }).click();
  // Totals come from the server quote: 12.00 + tax etc. The button carries the priced total.
  const place = guest.getByRole('button', { name: /Place order ·/ });
  await expect(place).toBeEnabled();
  await place.click();

  await expect(guest).toHaveURL(/\/my-orders\/[0-9a-f]{24}\/track/);
  const orderNumber = (await guest.getByText(/ORD-[A-Z0-9]+/).first().textContent())?.match(/(ORD-[A-Z0-9]+)/)?.[1];
  expect(orderNumber).toBeTruthy();

  // ── Owner ────────────────────────────────────────────────────────────────
  const ownerCtx = await browser.newContext();
  const owner = await ownerCtx.newPage();
  await asReturningVisitor(owner);
  await signIn(owner, SEED.owner.email, SEED.owner.password);
  await expect(owner).toHaveURL(/\/owner/);
  await owner.goto('/owner/orders');
  const ticket = owner.locator('article', { hasText: `#${orderNumber}` });
  await expect(ticket).toBeVisible();
  await ticket.getByRole('button', { name: 'Accept' }).click();
  await expect(owner.locator('section', { hasText: 'Accepted' }).locator('article', { hasText: `#${orderNumber}` })).toBeVisible();

  // ── Guest sees it move ───────────────────────────────────────────────────
  await guest.reload();
  await expect(guest.getByText('Accepted').first()).toBeVisible();

  await guestCtx.close();
  await ownerCtx.close();
});
