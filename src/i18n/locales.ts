// Languages the site can be published in. To add one: add it here, add its strings to ui.ts,
// and put translated entries in a subfolder named after it, e.g. src/content/destinations/de/istanbul.md.

export const LOCALES = {
  en: { name: 'English', htmlLang: 'en', ogLocale: 'en_GB', dateLocale: 'en-GB' },
  de: { name: 'Deutsch', htmlLang: 'de', ogLocale: 'de_DE', dateLocale: 'de-DE' },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_CODES = Object.keys(LOCALES) as Locale[];
export const OTHER_LOCALES = LOCALE_CODES.filter((l) => l !== DEFAULT_LOCALE);

export const isLocale = (value: unknown): value is Locale => typeof value === 'string' && value in LOCALES;

/** Astro.currentLocale, or the default for pages outside a locale folder. */
export const toLocale = (value: string | undefined): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

/**
 * Splits a content id into locale and slug. Translations sit in a locale subfolder, so
 * destinations/de/istanbul.md has id "de/istanbul": locale "de", slug "istanbul".
 */
export function splitId(id: string): { locale: Locale; slug: string } {
  const slash = id.indexOf('/');
  const first = slash === -1 ? '' : id.slice(0, slash);
  if (isLocale(first) && first !== DEFAULT_LOCALE) return { locale: first, slug: id.slice(slash + 1) };
  return { locale: DEFAULT_LOCALE, slug: id };
}

export const localeOf = (id: string): Locale => splitId(id).locale;
export const slugOf = (id: string): string => splitId(id).slug;

/** Content id of an entry's version in another locale. */
export const idIn = (id: string, locale: Locale): string => {
  const slug = slugOf(id);
  return locale === DEFAULT_LOCALE ? slug : `${locale}/${slug}`;
};

/** Prefixes a site path with the locale; the default locale has no prefix. */
export const localizePath = (path: string, locale: Locale): string =>
  locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;

/** Removes a locale prefix from a site path. */
export function delocalizePath(path: string): { locale: Locale; path: string } {
  const match = path.match(/^\/([a-z]{2})(\/.*)$/);
  if (match && isLocale(match[1]) && match[1] !== DEFAULT_LOCALE) return { locale: match[1], path: match[2] };
  return { locale: DEFAULT_LOCALE, path };
}
