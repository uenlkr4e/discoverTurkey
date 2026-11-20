import { describe, expect, it } from 'vitest';
import { delocalizePath, idIn, localizePath, splitId, toLocale } from '../../src/i18n/locales';
import { useTranslations } from '../../src/i18n/ui';
import { hrefFor, regionHref } from '../../src/lib/urls';
import { checkContent, type CheckEntry } from '../../src/lib/validate';

describe('content ids', () => {
  it('reads the locale from the subfolder', () => {
    expect(splitId('de/istanbul')).toEqual({ locale: 'de', slug: 'istanbul' });
    expect(splitId('istanbul')).toEqual({ locale: 'en', slug: 'istanbul' });
    // Only known, non-default locales count as locale folders.
    expect(splitId('en/istanbul')).toEqual({ locale: 'en', slug: 'en/istanbul' });
    expect(splitId('xx/istanbul')).toEqual({ locale: 'en', slug: 'xx/istanbul' });
  });

  it('maps an id to its version in another locale', () => {
    expect(idIn('istanbul', 'de')).toBe('de/istanbul');
    expect(idIn('de/istanbul', 'en')).toBe('istanbul');
    expect(idIn('de/istanbul', 'de')).toBe('de/istanbul');
  });
});

describe('paths', () => {
  it('prefixes only non-default locales', () => {
    expect(localizePath('/destinations/', 'en')).toBe('/destinations/');
    expect(localizePath('/destinations/', 'de')).toBe('/de/destinations/');
    expect(regionHref('aegean', 'de')).toBe('/de/regions/aegean/');
  });

  it('strips a locale prefix', () => {
    expect(delocalizePath('/de/destinations/istanbul/')).toEqual({ locale: 'de', path: '/destinations/istanbul/' });
    expect(delocalizePath('/destinations/')).toEqual({ locale: 'en', path: '/destinations/' });
    expect(delocalizePath('/de/')).toEqual({ locale: 'de', path: '/' });
  });

  it('builds translated entry URLs', () => {
    expect(hrefFor({ collection: 'destinations', id: 'de/istanbul', data: {} })).toBe('/de/destinations/istanbul/');
    expect(hrefFor({ collection: 'guides', id: 'de/money', data: { category: { id: 'money' } } })).toBe(
      '/de/guides/money/money/',
    );
    expect(hrefFor({ collection: 'pages', id: 'de/about', data: {} })).toBe('/de/about/');
  });

  it('falls back to the default locale for unknown values', () => {
    expect(toLocale(undefined)).toBe('en');
    expect(toLocale('fr')).toBe('en');
    expect(toLocale('de')).toBe('de');
  });
});

describe('useTranslations', () => {
  it('fills placeholders', () => {
    expect(useTranslations('en')('destination.eyebrow', { region: 'Aegean' })).toBe('Aegean region');
    expect(useTranslations('de')('destination.eyebrow', { region: 'Ägäis' })).toBe('Region Ägäis');
  });

  it('picks plural forms', () => {
    const en = useTranslations('en');
    expect(en.plural('common.days', 1)).toBe('1 day');
    expect(en.plural('common.days', 7)).toBe('7 days');
    expect(useTranslations('de').plural('search.results', 2, { term: 'x' })).toBe('2 Ergebnisse für „x“');
  });

  it('labels ads in German as required there', () => {
    expect(useTranslations('de')('common.advertisement')).toBe('Anzeige');
  });
});

describe('checkContent across languages', () => {
  const entry = (key: string, locale: string): CheckEntry => ({
    key,
    collection: 'destinations',
    locale,
    title: 'Istanbul',
    description: 'A city on two continents.',
    status: 'published',
    words: 400,
    links: [],
  });

  it('allows the same title in different languages', () => {
    expect(checkContent([entry('destinations/istanbul', 'en'), entry('destinations/de/istanbul', 'de')], new Date()).errors).toEqual([]);
  });

  it('still rejects duplicates within a language', () => {
    expect(checkContent([entry('destinations/a', 'de'), entry('destinations/b', 'de')], new Date()).errors).toHaveLength(2);
  });
});
