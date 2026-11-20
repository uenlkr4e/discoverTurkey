// getStaticPaths for every dynamic route, per locale. Pages in src/pages/ build the default
// locale; their copies in src/pages/[locale]/ build the other locales from the same templates.
import { DEFAULT_LOCALE, localizePath, OTHER_LOCALES, slugOf, type Locale } from '../i18n/locales';
import {
  getArticles,
  getAuthorsWithContent,
  getDestinations,
  getGuideCategoriesWithContent,
  getGuides,
  getInterestsWithContent,
  getItineraries,
  getItinerariesThrough,
  getListingPaths,
  getPages,
  getRegionsWithContent,
  hasContent,
} from './collections';

type Paths = { params: Record<string, string>; props?: Record<string, unknown> }[];

export async function destinationPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  return (await getDestinations(locale)).map((entry) => ({ params: { slug: slugOf(entry.id) }, props: { entry } }));
}

export async function itineraryPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  return (await getItineraries(locale)).map((entry) => ({ params: { slug: slugOf(entry.id) }, props: { entry } }));
}

export async function guidePaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  return (await getGuides(locale)).map((entry) => ({
    params: { category: entry.data.category.id, slug: slugOf(entry.id) },
    props: { entry },
  }));
}

export async function guideCategoryPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  const [categories, guides] = await Promise.all([getGuideCategoriesWithContent(locale), getGuides(locale)]);
  return categories.map((category) => ({
    params: { category: category.id },
    props: { category, guides: guides.filter((g) => g.data.category.id === category.id) },
  }));
}

export async function regionPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  const [regions, destinations] = await Promise.all([getRegionsWithContent(locale), getDestinations(locale)]);
  return Promise.all(
    regions.map(async (region) => {
      const inRegion = destinations.filter((d) => d.data.region.id === region.id);
      const itineraries = await getItinerariesThrough(new Set(inRegion.map((d) => d.id)), locale);
      return { params: { region: region.id }, props: { region, destinations: inRegion, itineraries } };
    }),
  );
}

export async function interestPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  const [interests, destinations, itineraries] = await Promise.all([
    getInterestsWithContent(locale),
    getDestinations(locale),
    getItineraries(locale),
  ]);
  const tagged = <T extends { data: { interests: { id: string }[] } }>(list: T[], id: string) =>
    list.filter((e) => e.data.interests.some((i) => i.id === id));
  return interests.map((interest) => ({
    params: { interest: interest.id },
    props: {
      interest,
      destinations: tagged(destinations, interest.id),
      itineraries: tagged(itineraries, interest.id),
    },
  }));
}

export async function pagePaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  return (await getPages(locale)).map((entry) => ({ params: { page: slugOf(entry.id) }, props: { entry } }));
}

export async function authorPaths(locale: Locale = DEFAULT_LOCALE): Promise<Paths> {
  const [authors, articles] = await Promise.all([getAuthorsWithContent(locale), getArticles(locale)]);
  return authors.map((author) => ({
    params: { author: author.id },
    props: { author, articles: articles.filter((e) => e.data.author.id === author.id) },
  }));
}

/** Runs a path generator for every non-default locale whose section of the site is built. */
export async function inOtherLocales(paths: (locale: Locale) => Promise<Paths>): Promise<Paths> {
  const results = await Promise.all(
    OTHER_LOCALES.map(async (locale) =>
      (await hasContent(locale))
        ? (await paths(locale)).map((p) => ({ ...p, params: { ...p.params, locale } }))
        : [],
    ),
  );
  return results.flat();
}

/** Paths for a non-dynamic page (home, search, listings) in each other locale where `when` holds. */
export function otherLocalesWhere(when: (locale: Locale) => Promise<boolean> = hasContent) {
  return async (): Promise<Paths> => {
    const paths = await Promise.all(
      OTHER_LOCALES.map(async (locale) => ((await hasContent(locale)) && (await when(locale)) ? [{ params: { locale } }] : [])),
    );
    return paths.flat();
  };
}


/** Paths for a listing page in each other locale where that listing is built (see getListingPaths). */
export const listingIn = (path: string) =>
  otherLocalesWhere(async (locale) => (await getListingPaths(locale)).includes(localizePath(path, locale)));
