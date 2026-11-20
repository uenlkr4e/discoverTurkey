import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
import { DEFAULT_LOCALE, idIn, LOCALE_CODES, localeOf, localizePath, type Locale } from '../i18n/locales';
import { isVisible } from './content';
import { pickRelated, type RelatedCandidate } from './related';
import { authorHref, entryKey, guideCategoryHref, hrefFor, interestHref, regionHref } from './urls';

/** Preview deployments (PUBLIC_ENV=preview) also render drafts, with a banner and noindex. */
export const showDrafts = import.meta.env.PUBLIC_ENV === 'preview';

export type Destination = CollectionEntry<'destinations'>;
export type Guide = CollectionEntry<'guides'>;
export type Itinerary = CollectionEntry<'itineraries'>;
export type ArticleEntry = Destination | Guide | Itinerary;
export type HeroImage = Destination['data']['heroImage'];

const byTitle = <T extends { data: { title: string } }>(a: T, b: T) => a.data.title.localeCompare(b.data.title, 'en');

/** Visible entries in one locale. Translations live in locale subfolders (ids like "de/istanbul"). */
const visibleIn =
  (locale: Locale) =>
  (e: { id: string; data: { status: 'draft' | 'in-review' | 'published' } }) =>
    localeOf(e.id) === locale && isVisible(e.data, showDrafts);

// Every page and listing must go through these getters so drafts never leak into production,
// and each language only ever lists its own entries.
export async function getDestinations(locale: Locale = DEFAULT_LOCALE): Promise<Destination[]> {
  return (await getCollection('destinations', visibleIn(locale))).sort(byTitle);
}

export async function getGuides(locale: Locale = DEFAULT_LOCALE): Promise<Guide[]> {
  return (await getCollection('guides', visibleIn(locale))).sort(byTitle);
}

export async function getItineraries(locale: Locale = DEFAULT_LOCALE): Promise<Itinerary[]> {
  return (await getCollection('itineraries', visibleIn(locale))).sort(
    (a, b) => a.data.days - b.data.days || byTitle(a, b),
  );
}

export async function getPages(locale: Locale = DEFAULT_LOCALE): Promise<CollectionEntry<'pages'>[]> {
  return getCollection('pages', visibleIn(locale));
}

export async function getArticles(locale: Locale = DEFAULT_LOCALE): Promise<ArticleEntry[]> {
  const [d, g, i] = await Promise.all([getDestinations(locale), getGuides(locale), getItineraries(locale)]);
  return [...d, ...g, ...i];
}

export async function resolve<C extends CollectionKey>(ref: { collection: C; id: string }): Promise<CollectionEntry<C>> {
  const entry = await getEntry(ref.collection, ref.id);
  if (!entry) throw new Error(`Missing ${ref.collection} entry "${ref.id}"`);
  return entry as CollectionEntry<C>;
}

/**
 * Taxonomy name and description in a locale. Translations are optional; until one is added,
 * the English text is used.
 */
export function taxonomyText(
  entry: CollectionEntry<'regions' | 'interests' | 'guideCategories'>,
  locale: Locale,
): { name: string; description: string } {
  const translated = locale === DEFAULT_LOCALE ? undefined : entry.data.translations?.[locale];
  return translated ?? { name: entry.data.name, description: entry.data.description };
}

// Taxonomy pages are only built when they have visible content, to avoid thin pages.
export async function getRegionsWithContent(locale: Locale = DEFAULT_LOCALE) {
  const [regions, destinations] = await Promise.all([getCollection('regions'), getDestinations(locale)]);
  return regions.filter((r) => destinations.some((d) => d.data.region.id === r.id));
}

export async function getInterestsWithContent(locale: Locale = DEFAULT_LOCALE) {
  const [interests, destinations, itineraries] = await Promise.all([
    getCollection('interests'),
    getDestinations(locale),
    getItineraries(locale),
  ]);
  const tagged = [...destinations, ...itineraries];
  return interests.filter((t) => tagged.some((e) => e.data.interests.some((i) => i.id === t.id)));
}

export async function getGuideCategoriesWithContent(locale: Locale = DEFAULT_LOCALE) {
  const [categories, guides] = await Promise.all([getCollection('guideCategories'), getGuides(locale)]);
  return categories.filter((c) => guides.some((g) => g.data.category.id === c.id));
}

/** Authors with visible articles; an author page is only built once there is something to list. */
export async function getAuthorsWithContent(locale: Locale = DEFAULT_LOCALE) {
  const [authors, articles] = await Promise.all([getCollection('authors'), getArticles(locale)]);
  return authors.filter((a) => articles.some((e) => e.data.author.id === a.id));
}

export async function getItinerariesThrough(destinationIds: Set<string>, locale: Locale = DEFAULT_LOCALE) {
  return (await getItineraries(locale)).filter((it) =>
    it.data.stops.some((s) => destinationIds.has(idIn(s.destination.id, locale))),
  );
}

function toCandidate(e: ArticleEntry): RelatedCandidate {
  return {
    key: entryKey(e),
    region: e.collection === 'destinations' ? e.data.region.id : undefined,
    interests: e.collection === 'guides' ? [] : e.data.interests.map((i) => i.id),
    tags: e.data.tags,
  };
}

/**
 * The entry's hand-picked related pages, as keys in the entry's own locale. A translation may
 * reference the English entries (the CMS copies the field); this points them at the translations.
 */
export function manualRelatedKeys(e: ArticleEntry): string[] {
  const locale = localeOf(e.id);
  return [...e.data.relatedDestinations, ...e.data.relatedGuides, ...e.data.relatedItineraries].map((ref) =>
    entryKey({ collection: ref.collection, id: idIn(ref.id, locale) }),
  );
}

export async function getRelatedFor(entry: ArticleEntry, limit = 4): Promise<ArticleEntry[]> {
  const all = await getArticles(localeOf(entry.id));
  const byKey = new Map(all.map((e) => [entryKey(e), e]));
  return pickRelated(toCandidate(entry), manualRelatedKeys(entry), all.map(toCandidate), limit).map(
    (k) => byKey.get(k)!,
  );
}

/** Listing and taxonomy URLs that are built for a locale, for the sitemap. Mirrors the page routes. */
export async function getListingPaths(locale: Locale = DEFAULT_LOCALE): Promise<string[]> {
  const [destinations, guides, itineraries, regions, interests, categories, authors] = await Promise.all([
    getDestinations(locale),
    getGuides(locale),
    getItineraries(locale),
    getRegionsWithContent(locale),
    getInterestsWithContent(locale),
    getGuideCategoriesWithContent(locale),
    getAuthorsWithContent(locale),
  ]);
  if (locale !== DEFAULT_LOCALE && !destinations.length && !guides.length && !itineraries.length) return [];
  const local = (path: string) => localizePath(path, locale);
  return [
    local('/'),
    ...(destinations.length ? [local('/destinations/'), local('/regions/')] : []),
    ...(guides.length ? [local('/guides/')] : []),
    ...(itineraries.length ? [local('/itineraries/')] : []),
    ...(interests.length ? [local('/interests/')] : []),
    ...regions.map((r) => regionHref(r.id, locale)),
    ...interests.map((i) => interestHref(i.id, locale)),
    ...categories.map((c) => guideCategoryHref(c.id, locale)),
    ...authors.map((a) => authorHref(a.id, locale)),
  ];
}

/** True when a locale has any visible articles, i.e. its section of the site is built. */
export async function hasContent(locale: Locale): Promise<boolean> {
  return (await getArticles(locale)).length > 0;
}

let builtPaths: Promise<Set<string>> | undefined;

/**
 * Every indexable page path across all locales. Used to link a page to its versions in other
 * languages only when they exist.
 */
export function getBuiltPaths(): Promise<Set<string>> {
  builtPaths ??= (async () => {
    const perLocale = await Promise.all(
      LOCALE_CODES.map(async (locale) => {
        const [listings, articles, pages] = await Promise.all([
          getListingPaths(locale),
          getArticles(locale),
          getPages(locale),
        ]);
        return [...listings, ...articles.map(hrefFor), ...pages.map(hrefFor)];
      }),
    );
    return new Set(perLocale.flat());
  })();
  return builtPaths;
}
