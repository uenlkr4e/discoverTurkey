import { describe, expect, it } from 'vitest';
import { adSlotHtml, adsTxt, insertInContentAd, parseAdsConfig } from '../../src/lib/ads';

const env = {
  PUBLIC_ADS_ENABLED: 'true',
  PUBLIC_ADSENSE_CLIENT: 'ca-pub-1234567890123456',
  PUBLIC_AD_SLOT_INCONTENT: '1111111111',
  PUBLIC_AD_SLOT_SIDEBAR: '2222222222',
  PUBLIC_AD_SLOT_FOOTER: '3333333333',
};

describe('parseAdsConfig', () => {
  it('is disabled unless explicitly enabled', () => {
    expect(parseAdsConfig({})).toBeNull();
    expect(parseAdsConfig({ ...env, PUBLIC_ADS_ENABLED: 'false' })).toBeNull();
  });

  it('parses client, slots and the non-personalized default', () => {
    expect(parseAdsConfig(env)).toEqual({
      client: 'ca-pub-1234567890123456',
      slots: { incontent: '1111111111', sidebar: '2222222222', footer: '3333333333' },
      nonPersonalized: true,
    });
  });

  it('allows personalized ads only in regional consent mode', () => {
    expect(parseAdsConfig({ ...env, PUBLIC_CONSENT_MODE: 'regional' })?.nonPersonalized).toBe(false);
  });

  it('omits placements without a slot id', () => {
    expect(parseAdsConfig({ ...env, PUBLIC_AD_SLOT_SIDEBAR: '' })?.slots).toEqual({
      incontent: '1111111111',
      footer: '3333333333',
    });
  });

  it('fails loudly on a malformed client or slot id', () => {
    expect(() => parseAdsConfig({ ...env, PUBLIC_ADSENSE_CLIENT: 'pub-123' })).toThrow(/PUBLIC_ADSENSE_CLIENT/);
    expect(() => parseAdsConfig({ ...env, PUBLIC_AD_SLOT_FOOTER: 'abc' })).toThrow(/PUBLIC_AD_SLOT_FOOTER/);
  });
});

describe('adSlotHtml', () => {
  const config = parseAdsConfig(env)!;

  it('renders a labelled, lazily activated unit', () => {
    expect(adSlotHtml('footer', config)).toBe(
      '<div class="ad-slot ad-slot--footer" data-ad-placement="footer" data-pagefind-ignore="all">' +
        '<p class="ad-label">Advertisement</p>' +
        '<ins class="ad-unit" data-ad-client="ca-pub-1234567890123456" data-ad-slot="3333333333"></ins></div>',
    );
  });

  it('renders nothing without config or slot', () => {
    expect(adSlotHtml('footer', null)).toBe('');
    expect(adSlotHtml('sidebar', { ...config, slots: {} })).toBe('');
  });
});

describe('insertInContentAd', () => {
  const words = (n: number) => `<p>${Array.from({ length: n }, () => 'word').join(' ')}</p>`;
  const insert = (html: string) => insertInContentAd(html, '<AD>', 100);

  it('inserts the ad before the third h2', () => {
    const html = `${words(60)}<h2>A</h2>${words(60)}<h2 id="b">B</h2><p>x</p><section><h2>C</h2></section>`;
    expect(insert(html)).toBe(`${words(60)}<h2>A</h2>${words(60)}<h2 id="b">B</h2><p>x</p><section><AD><h2>C</h2></section>`);
  });

  it('falls back to before the second h2', () => {
    expect(insert(`<h2>A</h2>${words(120)}<h2>B</h2>`)).toBe(`<h2>A</h2>${words(120)}<AD><h2>B</h2>`);
  });

  it('skips short articles', () => {
    const html = `<h2>A</h2>${words(20)}<h2>B</h2><h2>C</h2>`;
    expect(insert(html)).toBe(html);
  });

  it('never places an ad before the first heading', () => {
    const html = `${words(150)}<h2>Only heading</h2>`;
    expect(insert(html)).toBe(html);
  });

  it('counts only text, not markup', () => {
    const html = `<h2>A</h2><p class="${'x '.repeat(200)}">short</p><h2>B</h2>`;
    expect(insert(html)).toBe(html);
  });

  it('does nothing without an ad', () => {
    const html = `<h2>A</h2>${words(200)}<h2>B</h2>`;
    expect(insertInContentAd(html, '', 100)).toBe(html);
  });
});

describe('adsTxt', () => {
  it('declares Google as a direct seller for the publisher', () => {
    expect(adsTxt(parseAdsConfig(env)!)).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  });
});
