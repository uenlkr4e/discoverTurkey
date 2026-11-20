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

export interface ArticleLdInput {
  headline: string;
  description: string;
  url: string;
  authorName: string;
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
    author: { '@type': 'Person', name: input.authorName },
    publisher: { '@type': 'Organization', name: SITE.name },
    datePublished: published.toISOString(),
    dateModified: input.updatedAt.toISOString(),
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
