export type ArticleCollection = 'destinations' | 'guides' | 'itineraries';

export interface Linkable {
  collection: ArticleCollection | 'pages';
  id: string;
  data: unknown;
}

export function hrefFor(entry: Linkable): string {
  switch (entry.collection) {
    case 'destinations':
      return `/destinations/${entry.id}/`;
    case 'itineraries':
      return `/itineraries/${entry.id}/`;
    case 'pages':
      return `/${entry.id}/`;
    case 'guides': {
      const category = (entry.data as { category?: { id: string } }).category;
      if (!category) throw new Error(`Guide "${entry.id}" has no category`);
      return `/guides/${category.id}/${entry.id}/`;
    }
  }
}

export const regionHref = (id: string) => `/regions/${id}/`;
export const interestHref = (id: string) => `/interests/${id}/`;
export const guideCategoryHref = (id: string) => `/guides/${id}/`;

export function entryKey(entry: { collection: string; id: string }): string {
  return `${entry.collection}/${entry.id}`;
}

export const COLLECTION_LABEL: Record<ArticleCollection, string> = {
  destinations: 'Destination',
  guides: 'Guide',
  itineraries: 'Itinerary',
};
