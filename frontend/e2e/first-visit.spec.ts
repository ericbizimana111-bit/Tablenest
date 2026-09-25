import { expect, test } from '@playwright/test';
import { localOnly, SEED } from './helpers';

test('first visit: welcome plays once, the guide asks who you are, and the landing shows real restaurants', async ({ page }) => {
  await localOnly(page);
  // Watch from first paint: the welcome lasts ~2.4s, shorter than a cold dev-server page load.
  await page.goto('/', { waitUntil: 'commit' });

  // The cloche welcome can be skipped and never comes back in the same session.
  const skip = page.getByRole('button', { name: 'Skip' });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(skip).toBeHidden();

  // The onboarding guide opens by itself for a brand-new visitor.
  await page.getByRole('button', { name: /I'm hungry/ }).click();
  await expect(page.getByRole('dialog').getByText('Find your place')).toBeVisible();
  await page.keyboard.press('Escape');

  // Seeded (real) data, no placeholders.
  await expect(page.getByText(SEED.restaurant).first()).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Skip' })).toHaveCount(0);
});
