import { expect, gaEvents, test } from './test';

const GUIDE = '/guides/transport/getting-around-turkey/';

test.describe('ad placements', () => {
  test('long articles get one in-content ad after the second section', async ({ page }) => {
    await page.goto(GUIDE);
    const main = page.locator('.article-main');
    await expect(main.locator('.ad-slot--incontent')).toHaveCount(1);
    const order = await main.locator('h2, .ad-slot').evaluateAll((els) =>
      els.map((el) => (el.tagName === 'H2' ? el.textContent : 'AD')),
    );
    expect(order).toEqual(['Long-distance travel', 'City transport', 'AD', 'Ferries', 'Driving']);
  });

  test('short articles get no in-content ad', async ({ page }) => {
    await page.goto('/destinations/istanbul/');
    await expect(page.locator('.ad-slot--incontent')).toHaveCount(0);
    await expect(page.locator('.ad-slot--footer')).toHaveCount(1);
  });

  test('every ad is labelled and sits after the main heading', async ({ page }) => {
    await page.goto(GUIDE);
    for (const slot of await page.locator('.ad-slot').all()) {
      await expect(slot.locator('.ad-label')).toHaveText('Advertisement');
    }
    const h1Top = (await page.locator('h1').boundingBox())!.y;
    for (const slot of await page.locator('.ad-slot:visible').all()) {
      expect((await slot.boundingBox())!.y).toBeGreaterThan(h1Top);
    }
  });

  test('the sidebar unit shows only on wide screens', async ({ page }, testInfo) => {
    await page.goto(GUIDE);
    const sidebar = page.locator('.ad-slot--sidebar');
    if (testInfo.project.name === 'desktop') await expect(sidebar).toBeVisible();
    else await expect(sidebar).toBeHidden();
  });

  test('ads stay out of navigation, search and legal pages', async ({ page }) => {
    for (const path of ['/search/?q=istanbul', '/about/', '/no-such-page/']) {
      await page.goto(path);
      await expect(page.locator('.ad-slot')).toHaveCount(0);
    }
    await page.goto('/');
    await expect(page.locator('header .ad-slot, nav .ad-slot, .hero .ad-slot')).toHaveCount(0);
    await expect(page.locator('.ad-slot')).toHaveCount(1);
  });

  test('ads are excluded from the search index', async ({ page }) => {
    await page.goto('/search/');
    // Read back every indexed page; Pagefind's own matching is too fuzzy to assert on.
    const indexed = await page.evaluate(async () => {
      const path = '/pagefind/pagefind.js';
      const pagefind = await import(/* @vite-ignore */ path);
      const all = await pagefind.search(null, {});
      return Promise.all(all.results.map(async (r: { data: () => Promise<{ content: string }> }) => (await r.data()).content));
    });
    expect(indexed.length).toBeGreaterThan(0);
    for (const content of indexed) expect(content).not.toMatch(/advertisement/i);
  });
});

test.describe('ad loading', () => {
  test('units load only when near the viewport, in strict non-personalized mode', async ({ page }) => {
    await page.goto(GUIDE);
    const footer = page.locator('.ad-slot--footer ins');
    await expect(footer).not.toHaveClass(/adsbygoogle/);
    await expect(footer).not.toHaveAttribute('data-ad-status');

    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveAttribute('data-ad-status', 'filled');
    expect(await page.evaluate(() => (window as unknown as { __adsenseLoads: number }).__adsenseLoads)).toBe(1);
    expect(await page.evaluate(() => (window as unknown as { __adsenseNpa: number }).__adsenseNpa)).toBe(1);
  });

  test('filled slots keep their reserved size', async ({ page }) => {
    await page.goto(GUIDE);
    const slot = page.locator('.ad-slot--footer');
    const before = (await slot.boundingBox())!.height;
    await slot.scrollIntoViewIfNeeded();
    await expect(slot.locator('ins')).toHaveAttribute('data-ad-status', 'filled');
    expect((await slot.boundingBox())!.height).toBe(before);
  });

  test('no layout shift while ads load and the page is scrolled', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!entry.hadRecentInput) w.__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(GUIDE, { waitUntil: 'networkidle' });
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(100);
    }
    await expect(page.locator('.ad-slot--footer ins')).toHaveAttribute('data-ad-status', 'filled');
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.1);
  });
});

test.describe('consent and analytics', () => {
  test('consent defaults to denied before any Google tag loads', async ({ page }) => {
    await page.goto('/');
    const first = await page.evaluate(() => Array.from(window.dataLayer[0] as ArrayLike<unknown>));
    expect(first).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      },
    ]);
    const order = await page.locator('head script').evaluateAll((scripts) =>
      scripts.map((s) => (s as HTMLScriptElement).src || (s.textContent?.includes("'consent'") ? 'consent' : '')),
    );
    expect(order.indexOf('consent')).toBeLessThan(order.findIndex((s) => s.includes('googletagmanager')));
  });

  test('ad render and viewability are reported', async ({ page }) => {
    await page.goto(GUIDE);
    await page.locator('.ad-slot--footer').scrollIntoViewIfNeeded();
    await expect.poll(async () => (await gaEvents(page)).map(([name, p]) => `${name}:${p.placement}`)).toEqual(
      expect.arrayContaining(['ad_slot_rendered:footer', 'ad_slot_viewable:footer']),
    );
  });

  test('searches are reported with their result count', async ({ page }) => {
    await page.goto('/search/?q=cappadocia');
    await expect(page.getByRole('status')).toHaveText(/result/);
    expect(await gaEvents(page)).toContainEqual(['search', { search_term: 'cappadocia', result_count: 2 }]);
  });

  test('outbound links are reported by domain', async ({ page }) => {
    await page.goto('/destinations/istanbul/');
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
    await page.getByRole('link', { name: 'Istanbul on OpenStreetMap' }).click();
    expect(await gaEvents(page)).toContainEqual(['outbound_click', { link_domain: 'www.openstreetmap.org' }]);
  });

  test('sharing is reported without double-counting as an outbound click', async ({ page }) => {
    await page.goto('/destinations/istanbul/');
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
    await page.getByRole('link', { name: /WhatsApp/ }).click();
    const events = await gaEvents(page);
    expect(events).toContainEqual(['share', { method: 'whatsapp', content_type: 'destination' }]);
    expect(events.filter(([name]) => name === 'outbound_click')).toEqual([]);
  });

  test('copy link confirms success', async ({ page, context }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Clipboard permissions are only granted on desktop Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/destinations/istanbul/');
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByText('Link copied')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('http://localhost:4321/destinations/istanbul/');
  });

  test('privacy settings stay hidden until the consent platform is ready', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('[data-privacy-settings]');
    await expect(button).toBeHidden();
    await page.evaluate(() => {
      const queue = window.googlefc!.callbackQueue!;
      for (const item of queue) if (typeof item === 'object') item.CONSENT_API_READY?.();
    });
    await expect(page.getByRole('button', { name: 'Privacy settings' })).toBeVisible();
  });

  test('ads.txt declares the publisher', async ({ request }) => {
    expect(await (await request.get('/ads.txt')).text()).toBe(
      'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n',
    );
  });
});
