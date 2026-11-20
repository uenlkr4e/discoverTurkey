import { type Page } from '@playwright/test';
import { expect, test } from './test';

async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b)['@type']);
}

test.describe('destination page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/destinations/istanbul/');
  });

  test('has unique metadata, canonical URL and structured data', async ({ page }) => {
    await expect(page).toHaveTitle('Istanbul | Discover Turkey');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /fixture destination for Istanbul/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/destinations/istanbul/',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^http:\/\/localhost:4321\/.+\.jpe?g$/);
    expect(await jsonLdTypes(page)).toEqual(['Article', 'TouristDestination', 'BreadcrumbList']);
  });

  test('renders every template section', async ({ page }) => {
    for (const name of [
      'Best time to visit',
      'Top attractions and things to do',
      'Getting there',
      'Getting around',
      'Food and local experiences',
      'Map',
      'Keep planning',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    await expect(page.getByText('Last reviewed 1 October 2026 by Test Editor')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Istanbul on Google Maps' })).toHaveAttribute('href', /41\.0082,28\.9784/);
    await expect(page.getByRole('img', { name: 'Fixture image standing in for the Istanbul skyline' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Test Fixture' })).toHaveAttribute('href', 'https://example.com/photo');
  });

  test('links to related content', async ({ page }) => {
    const related = page.getByRole('region', { name: 'Keep planning' });
    await expect(related.getByRole('link', { name: 'Getting around Turkey' })).toBeVisible();
    await expect(related.getByRole('link', { name: 'Cappadocia' })).toBeVisible();
  });
});

test('guide page shows the official-sources notice and hides the reviewer checklist', async ({ page }) => {
  await page.goto('/guides/transport/getting-around-turkey/');
  await expect(page.getByText(/Check the official sources linked in this guide/)).toBeVisible();
  await expect(page.getByText('Fixture fact to verify')).toHaveCount(0);
  expect(await jsonLdTypes(page)).toEqual(['Article', 'BreadcrumbList']);
});

test.describe('publication gate', () => {
  for (const path of ['/destinations/draft-town/', '/guides/money/money-matters-draft/', '/regions/aegean/', '/interests/beaches/']) {
    test(`${path} is not built`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
    });
  }

  test('itinerary stops do not link to unpublished destinations', async ({ page }) => {
    await page.goto('/itineraries/classic-week/');
    await expect(page.getByRole('heading', { name: 'Day 7: Coastal finale' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Read our Cappadocia guide' })).toBeVisible();
    await expect(page.locator('a[href*="draft-town"]')).toHaveCount(0);
  });

  test('no page links to a draft', async ({ page }) => {
    for (const path of ['/', '/destinations/', '/guides/', '/interests/history/']) {
      await page.goto(path);
      await expect(page.locator('a[href*="draft"]')).toHaveCount(0);
    }
  });
});

test('region and interest pages list matching content', async ({ page }) => {
  await page.goto('/regions/marmara/');
  await expect(page.getByRole('link', { name: 'Istanbul' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'A classic week in Turkey' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cappadocia' })).toHaveCount(0);

  await page.goto('/interests/history/');
  await expect(page.getByRole('region', { name: 'Destinations' }).getByRole('link')).toHaveText([
    'Cappadocia',
    'Istanbul',
  ]);
});

test('sitemap lists published pages only', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/', '/destinations/istanbul/', '/guides/transport/getting-around-turkey/', '/regions/marmara/', '/about/']) {
    expect(xml).toContain(`<loc>http://localhost:4321${path}</loc>`);
  }
  for (const fragment of ['draft', '/search/', '/privacy/', '/regions/aegean/']) {
    expect(xml).not.toContain(fragment);
  }
});

test('robots.txt points at the sitemap', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: http://localhost:4321/sitemap.xml');
});

test('search and legal pages are noindex where appropriate', async ({ page }) => {
  await page.goto('/search/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.goto('/about/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
});

test('unknown URLs show a helpful 404 page', async ({ page }) => {
  const response = await page.goto('/no-such-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.getByRole('search')).toBeVisible();
});
