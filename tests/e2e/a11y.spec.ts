import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/',
  '/destinations/',
  '/destinations/istanbul/',
  '/guides/',
  '/guides/transport/',
  '/guides/transport/getting-around-turkey/',
  '/itineraries/',
  '/itineraries/classic-week/',
  '/regions/',
  '/regions/marmara/',
  '/interests/',
  '/interests/history/',
  '/search/?q=istanbul',
  '/about/',
  '/no-such-page/',
];

for (const path of PAGES) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(path);
    if (path.startsWith('/search/')) await expect(page.getByRole('status')).toHaveText(/result/);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('no layout shift while the destination page loads', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('/destinations/istanbul/', { waitUntil: 'networkidle' });
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(500);
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls).toBeLessThan(0.1);
});
