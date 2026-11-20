import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';
import { isVisible } from './content';
import { pickRelated, type RelatedCandidate } from './related';
import { authorHref, entryKey, guideCategoryHref, interestHref, regionHref } from './urls';

/** Preview deployments (PUBLIC_ENV=preview) also render drafts, with a banner and noindex. */
export const showDrafts = import.meta.env.PUBLIC_ENV === 'preview';

export type Destination = CollectionEntry<'destinations'>;
export type Guide = CollectionEntry<'guides'>;
export type Itinerary = CollectionEntry<'itineraries'>;
export type ArticleEntry = Destination | Guide | Itinerary;
export type HeroImage = Destination['data']['heroImage'];

const byTitle = <T extends { data: { title: string } }>(a: T, b: T) => a.data.title.localeCompare(b.data.title, 'en');

// Every page and listing must go through these getters so drafts never leak into production.
export async function getDestinations(): Promise<Destination[]> {
  return (await getCollection('destinations', (e) => isVisible(e.data, showDrafts))).sort(byTitle);
}

export async function getGuides(): Promise<Guide[]> {
  return (await getCollection('guides', (e) => isVisible(e.data, showDrafts))).sort(byTitle);
}

export async function getItineraries(): Promise<Itinerary[]> {
  return (await getCollection('itineraries', (e) => isVisible(e.data, showDrafts))).sort(
    (a, b) => a.data.days - b.data.days || byTitle(a, b),
  );
}

export async function getPages(): Promise<CollectionEntry<'pages'>[]> {
  return getCollection('pages', (e) => isVisible(e.data, showDrafts));
}

export async function getArticles(): Promise<ArticleEntry[]> {
  const [d, g, i] = await Promise.all([getDestinations(), getGuides(), getItineraries()]);
  return [...d, ...g, ...i];
}

export async function resolve<C extends CollectionKey>(ref: { collection: C; id: string }): Promise<CollectionEntry<C>> {
  const entry = await getEntry(ref.collection, ref.id);
  if (!entry) throw new Error(`Missing ${ref.collection} entry "${ref.id}"`);
  return entry as CollectionEntry<C>;
}

// Taxonomy pages are only built when they have visible content, to avoid thin pages.
export async function getRegionsWithContent() {
  const [regions, destinations] = await Promise.all([getCollection('regions'), getDestinations()]);
  return regions.filter((r) => destinations.some((d) => d.data.region.id === r.id));
}

export async function getInterestsWithContent() {
  const [interests, destinations, itineraries] = await Promise.all([
    getCollection('interests'),
    getDestinations(),
    getItineraries(),
  ]);
  const tagged = [...destinations, ...itineraries];
  return interests.filter((t) => tagged.some((e) => e.data.interests.some((i) => i.id === t.id)));
}

export async function getGuideCategoriesWithContent() {
  const [categories, guides] = await Promise.all([getCollection('guideCategories'), getGuides()]);
  return categories.filter((c) => guides.some((g) => g.data.category.id === c.id));
}

/** Authors with visible articles; an author page is only built once there is something to list. */
export async function getAuthorsWithContent() {
  const [authors, articles] = await Promise.all([getCollection('authors'), getArticles()]);
  return authors.filter((a) => articles.some((e) => e.data.author.id === a.id));
}

export async function getItinerariesThrough(destinationIds: Set<string>): Promise<Itinerary[]> {
  return (await getItineraries()).filter((it) => it.data.stops.some((s) => destinationIds.has(s.destination.id)));
}

function toCandidate(e: ArticleEntry): RelatedCandidate {
  return {
    key: entryKey(e),
    region: e.collection === 'destinations' ? e.data.region.id : undefined,
    interests: e.collection === 'guides' ? [] : e.data.interests.map((i) => i.id),
    tags: e.data.tags,
  };
}

export function manualRelatedKeys(e: ArticleEntry): string[] {
  return [...e.data.relatedDestinations, ...e.data.relatedGuides, ...e.data.relatedItineraries].map(entryKey);
}

export async function getRelatedFor(entry: ArticleEntry, limit = 4): Promise<ArticleEntry[]> {
  const all = await getArticles();
  const byKey = new Map(all.map((e) => [entryKey(e), e]));
  return pickRelated(toCandidate(entry), manualRelatedKeys(entry), all.map(toCandidate), limit).map(
    (k) => byKey.get(k)!,
  );
}

/** Listing and taxonomy URLs that are built, for the sitemap. Mirrors the page routes. */
export async function getListingPaths(): Promise<string[]> {
  const [destinations, guides, itineraries, regions, interests, categories, authors] = await Promise.all([
    getDestinations(),
    getGuides(),
    getItineraries(),
    getRegionsWithContent(),
    getInterestsWithContent(),
    getGuideCategoriesWithContent(),
    getAuthorsWithContent(),
  ]);
  return [
    '/',
    ...(destinations.length ? ['/destinations/', '/regions/'] : []),
    ...(guides.length ? ['/guides/'] : []),
    ...(itineraries.length ? ['/itineraries/'] : []),
    ...(interests.length ? ['/interests/'] : []),
    ...regions.map((r) => regionHref(r.id)),
    ...interests.map((i) => interestHref(i.id)),
    ...categories.map((c) => guideCategoryHref(c.id)),
    ...authors.map((a) => authorHref(a.id)),
  ];
}
