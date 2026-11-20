import { DEFAULT_LOCALE, localizePath, splitId, type Locale } from '../i18n/locales';

export type ArticleCollection = 'destinations' | 'guides' | 'itineraries';

export interface Linkable {
  collection: ArticleCollection | 'pages';
  id: string;
  data: unknown;
}

/** URL of an entry. Translations (ids like "de/istanbul") get their locale prefix. */
export function hrefFor(entry: Linkable): string {
  const { locale, slug } = splitId(entry.id);
  return localizePath(pathFor(entry, slug), locale);
}

function pathFor(entry: Linkable, slug: string): string {
  switch (entry.collection) {
    case 'destinations':
      return `/destinations/${slug}/`;
    case 'itineraries':
      return `/itineraries/${slug}/`;
    case 'pages':
      return `/${slug}/`;
    case 'guides': {
      const category = (entry.data as { category?: { id: string } }).category;
      if (!category) throw new Error(`Guide "${entry.id}" has no category`);
      return `/guides/${category.id}/${slug}/`;
    }
  }
}

export const regionHref = (id: string, locale: Locale = DEFAULT_LOCALE) => localizePath(`/regions/${id}/`, locale);
export const interestHref = (id: string, locale: Locale = DEFAULT_LOCALE) => localizePath(`/interests/${id}/`, locale);
export const guideCategoryHref = (id: string, locale: Locale = DEFAULT_LOCALE) =>
  localizePath(`/guides/${id}/`, locale);
export const authorHref = (id: string, locale: Locale = DEFAULT_LOCALE) => localizePath(`/authors/${id}/`, locale);

export function entryKey(entry: { collection: string; id: string }): string {
  return `${entry.collection}/${entry.id}`;
}
