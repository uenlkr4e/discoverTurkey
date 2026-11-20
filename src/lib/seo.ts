import { SITE } from '../config/site';

export interface Crumb {
  name: string;
  href: string;
}

type Site = URL | string;

export function pageTitle(title: string, seoTitle?: string): string {
  return `${seoTitle ?? title} | ${SITE.name}`;
}

export function absoluteUrl(path: string, site: Site): string {
  return new URL(path, site).href;
}

export function breadcrumbLd(crumbs: Crumb[], site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href, site),
    })),
  };
}

export interface AuthorRef {
  name: string;
  kind: 'person' | 'organization';
  /** Absolute URL of the author's page on this site. */
  url?: string;
}

const authorType = (kind: AuthorRef['kind']) => (kind === 'organization' ? 'Organization' : 'Person');

export interface ArticleLdInput {
  headline: string;
  description: string;
  url: string;
  author: AuthorRef;
  updatedAt: Date;
  reviewedAt?: Date;
  publishedAt?: Date;
  image?: string;
}

export function articleLd(input: ArticleLdInput) {
  const published = input.publishedAt ?? input.reviewedAt ?? input.updatedAt;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: input.url,
    ...(input.image ? { image: [input.image] } : {}),
    author: {
      '@type': authorType(input.author.kind),
      name: input.author.name,
      ...(input.author.url ? { url: input.author.url } : {}),
    },
    publisher: { '@type': 'Organization', name: SITE.name },
    datePublished: published.toISOString(),
    dateModified: input.updatedAt.toISOString(),
  };
}

export interface AuthorProfileInput extends AuthorRef {
  url: string;
  description: string;
  jobTitle?: string;
  image?: string;
  knowsAbout?: string[];
  sameAs?: string[];
}

/** ProfilePage for an author page, so search engines can connect bylines to a real person. */
export function profilePageLd(input: AuthorProfileInput) {
  const knowsAbout = input.knowsAbout ?? [];
  const sameAs = input.sameAs ?? [];
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: input.url,
    mainEntity: {
      '@type': authorType(input.kind),
      name: input.name,
      url: input.url,
      description: input.description,
      ...(input.jobTitle && input.kind === 'person' ? { jobTitle: input.jobTitle } : {}),
      ...(input.image ? { image: input.image } : {}),
      ...(knowsAbout.length ? { knowsAbout } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
  };
}

export function touristDestinationLd(input: {
  name: string;
  description: string;
  url: string;
  lat: number;
  lng: number;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.image ? { image: input.image } : {}),
    geo: { '@type': 'GeoCoordinates', latitude: input.lat, longitude: input.lng },
  };
}

export function websiteLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: absoluteUrl('/', site),
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${absoluteUrl('/search/', site)}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: absoluteUrl('/', site),
    logo: absoluteUrl('/favicon.svg', site),
  };
}

/** Serialise for an inline <script type="application/ld+json">. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
