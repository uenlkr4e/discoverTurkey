import { expect, test } from './test';

test('returns the matching destination first', async ({ page }) => {
  await page.goto('/search/?q=cappadocia');
  await expect(page.getByRole('status')).toHaveText(/result.* for “cappadocia”/);
  const first = page.locator('#search-results li').first();
  await expect(first.getByRole('link')).toHaveText('Cappadocia');
  await expect(first.locator('.eyebrow')).toHaveText('Destination');
});

test('filters results by content type', async ({ page }) => {
  // "transport" appears in both destination and guide fixtures.
  await page.goto('/search/?q=transport');
  await expect(page.locator('#search-results .eyebrow')).toContainText(['Destination']);
  await page.goto('/search/?q=transport&type=Guide');
  await expect(page.getByRole('status')).toHaveText('1 result for “transport”');
  await expect(page.locator('#search-results .eyebrow')).toHaveText(['Guide']);
});

test('never returns drafts', async ({ page }) => {
  await page.goto('/search/?q=draft');
  await expect(page.getByRole('status')).toHaveText('0 results for “draft”');
});

test('homepage search submits to the search page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search destinations and guides' }).fill('istanbul');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search\/\?q=istanbul$/);
  await expect(page.locator('#search-results li').first().getByRole('link')).toHaveText('Istanbul');
});

test('search form works without reloading and updates the URL', async ({ page }) => {
  await page.goto('/search/');
  await page.getByLabel('Search destinations and guides').fill('transport');
  await page.getByLabel('Show').selectOption('Guide');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/q=transport&type=Guide/);
  await expect(page.locator('#search-results li').first().getByRole('link')).toHaveText('Getting around Turkey');
});
