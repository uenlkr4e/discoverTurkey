import { test as base, expect, type Page } from '@playwright/test';

/**
 * Stand-in for adsbygoogle.js: every push() fills each activated, unprocessed unit with a
 * placeholder the size of its container, as AdSense does, and marks it filled.
 */
const ADSENSE_STUB = `
(() => {
  const queued = window.adsbygoogle || [];
  const fill = () => {
    document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])').forEach((ins) => {
      ins.setAttribute('data-adsbygoogle-status', 'done');
      const ad = document.createElement('div');
      ad.style.cssText = 'width:100%;height:100%;background:#cfd8dc';
      ins.append(ad);
      ins.setAttribute('data-ad-status', 'filled');
    });
  };
  window.__adsenseLoads = (window.__adsenseLoads || 0) + 1;
  window.__adsenseNpa = queued.requestNonPersonalizedAds;
  window.adsbygoogle = { push: fill, requestNonPersonalizedAds: queued.requestNonPersonalizedAds };
  if (queued.length) fill();
})();`;

export const test = base.extend<{ stubGoogle: void }>({
  stubGoogle: [
    async ({ page }, use) => {
      await page.route(/pagead2\.googlesyndication\.com/, (route) =>
        route.fulfill({ contentType: 'text/javascript', body: ADSENSE_STUB }),
      );
      await page.route(/googletagmanager\.com/, (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await use();
    },
    { auto: true },
  ],
});

export { expect };

/** GA4 events queued via gtag('event', name, params), as [name, params] pairs. */
export async function gaEvents(page: Page): Promise<[string, Record<string, unknown>][]> {
  return page.evaluate(() =>
    (window.dataLayer as ArrayLike<unknown>[])
      .map((args) => Array.from(args))
      .filter((args) => args[0] === 'event')
      .map((args) => [args[1], args[2]] as [string, Record<string, unknown>]),
  );
}
