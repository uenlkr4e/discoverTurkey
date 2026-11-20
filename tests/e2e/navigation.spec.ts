import { expect, test } from './test';

test('homepage leads to featured destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Discover where to go and what to do in Turkey');
  const featured = page.getByRole('region', { name: 'Featured destinations' });
  await featured.getByRole('link', { name: 'Istanbul' }).click();
  await expect(page).toHaveURL(/\/destinations\/istanbul\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Istanbul');
});

test('homepage offers browsing by region and interest', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('region', { name: 'Browse by region' }).getByRole('link', { name: 'Marmara' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Marmara region');
  await page.goto('/');
  await page.getByRole('region', { name: 'Browse by interest' }).getByRole('link', { name: 'Nature' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nature in Turkey');
});

test('homepage shows seasonal recommendations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /^Where to go in (spring|summer|autumn|winter)$/ })).toBeVisible();
});

test('skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('a destination can be reached with the keyboard alone', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const text = await page.evaluate(() => document.activeElement?.textContent?.trim());
    if (text === 'Cappadocia') break;
  }
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/destinations\/cappadocia\/$/);
});

test('mobile menu opens, and Escape closes it and restores focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'The menu toggle only exists on small screens');
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu' });
  const navLink = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Destinations' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(navLink).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navLink).toBeVisible();
  await navLink.focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('desktop navigation is always visible and marks the current section', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop layout only');
  await page.goto('/destinations/istanbul/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(nav.getByRole('link', { name: 'Destinations' })).toHaveAttribute('aria-current', 'page');
});

test('breadcrumbs link back up the hierarchy', async ({ page }) => {
  await page.goto('/guides/transport/getting-around-turkey/');
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(crumbs.getByRole('link')).toHaveText(['Home', 'Travel tips', 'Transport']);
  await crumbs.getByRole('link', { name: 'Transport' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Transport tips for Turkey');
});
