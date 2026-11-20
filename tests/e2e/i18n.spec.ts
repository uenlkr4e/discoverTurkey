import { expect, test } from './test';

// Fixtures: destinations/de/istanbul (published), destinations/de/cappadocia (draft), pages/de/about.

test.describe('German translation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/destinations/istanbul/');
  });

  test('is served in German with German metadata', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'de_DE');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/de/destinations/istanbul/',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
  });

  test('uses German interface text, dates and ad labels', async ({ page }) => {
    for (const name of ['Beste Reisezeit', 'Anreise', 'Unterwegs vor Ort', 'Karte']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    await expect(page.getByText('Zuletzt geprüft am 1. Oktober 2026 von Test Editor')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Istanbul bei Google Maps' })).toBeVisible();
    await expect(page.locator('.ad-label').first()).toHaveText('Anzeige');
    await expect(page.getByRole('navigation', { name: 'Navigationspfad' }).getByRole('link', { name: 'Startseite' })).toHaveAttribute(
      'href',
      '/de/',
    );
  });

  test('links its language versions with hreflang', async ({ page }) => {
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/destinations/istanbul/',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/de/destinations/istanbul/',
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      'http://localhost:4321/destinations/istanbul/',
    );
  });

  test('never links to untranslated or draft entries', async ({ page }) => {
    await expect(page.locator('main a[href*="cappadocia"]')).toHaveCount(0);
  });
});

test('the English page offers the German version', async ({ page, isMobile }) => {
  await page.goto('/destinations/istanbul/');
  await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveAttribute(
    'href',
    'http://localhost:4321/de/destinations/istanbul/',
  );
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  const link = page.getByRole('link', { name: 'Diese Seite auf Deutsch' });
  await expect(link).toHaveAttribute('href', '/de/destinations/istanbul/');
  await expect(link).toHaveAttribute('hreflang', 'de');
});

test('untranslated pages have no hreflang', async ({ page }) => {
  await page.goto('/destinations/cappadocia/');
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

test('the German homepage lists only German content', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('heading', { level: 2, name: 'Ausgewählte Reiseziele' })).toBeVisible();
  await expect(page.locator('main a[href="/de/destinations/istanbul/"]').first()).toBeVisible();
  await expect(page.locator('main a[href*="/destinations/cappadocia/"]')).toHaveCount(0);
});

test('English listings never include translations', async ({ page }) => {
  await page.goto('/destinations/');
  await expect(page.locator('main a[href^="/de/"]')).toHaveCount(0);
});

test('German drafts and empty sections are not built', async ({ request }) => {
  expect((await request.get('/de/destinations/cappadocia/')).status()).toBe(404);
  // No German guides or itineraries in the fixtures.
  expect((await request.get('/de/guides/')).status()).toBe(404);
  expect((await request.get('/de/itineraries/')).status()).toBe(404);
});

test('German pages link to translated pages, falling back to English', async ({ page }) => {
  await page.goto('/de/destinations/istanbul/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Über uns' })).toHaveAttribute('href', '/de/about/');
  await expect(footer.getByRole('link', { name: 'Datenschutz' })).toHaveAttribute('href', '/privacy/');
  await expect(footer.getByRole('link', { name: 'Reiseziele' })).toHaveAttribute('href', '/de/destinations/');
  await expect(footer.getByRole('link', { name: 'Reisetipps' })).toHaveAttribute('href', '/guides/');
});

test('the sitemap lists published translations only', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('<loc>http://localhost:4321/de/destinations/istanbul/</loc>');
  expect(xml).toContain('<loc>http://localhost:4321/de/</loc>');
  expect(xml).not.toContain('/de/destinations/cappadocia/');
});

test('German search finds German pages', async ({ page }) => {
  await page.goto('/de/search/?q=istanbul');
  await expect(page.locator('#search-status')).toHaveText(/Ergebnis(se)? für „istanbul“/);
  await expect(page.locator('#search-results a[href="/de/destinations/istanbul/"]')).toBeVisible();
  await expect(page.locator('#search-results a[href="/destinations/istanbul/"]')).toHaveCount(0);
});
