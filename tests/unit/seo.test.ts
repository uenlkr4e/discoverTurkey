import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  articleLd,
  breadcrumbLd,
  jsonLdScript,
  pageTitle,
  touristDestinationLd,
  websiteLd,
} from '../../src/lib/seo';

const site = 'https://example.com';

describe('pageTitle', () => {
  it('appends the site name and prefers the SEO title', () => {
    expect(pageTitle('Istanbul')).toBe('Istanbul | Discover Turkey');
    expect(pageTitle('Istanbul', 'Istanbul travel guide')).toBe('Istanbul travel guide | Discover Turkey');
  });
});

describe('absoluteUrl', () => {
  it('resolves paths against the site', () => {
    expect(absoluteUrl('/destinations/istanbul/', site)).toBe('https://example.com/destinations/istanbul/');
  });
});

describe('breadcrumbLd', () => {
  it('lists crumbs with positions and absolute URLs', () => {
    const ld = breadcrumbLd(
      [
        { name: 'Home', href: '/' },
        { name: 'Destinations', href: '/destinations/' },
      ],
      site,
    );
    expect(ld['@type']).toBe('BreadcrumbList');
    expect(ld.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: 'https://example.com/destinations/' },
    ]);
  });
});

describe('articleLd', () => {
  const base = {
    headline: 'Getting around',
    description: 'How to travel between cities.',
    url: 'https://example.com/guides/transport/getting-around/',
    authorName: 'Editorial team',
    updatedAt: new Date('2026-10-01'),
  };

  it('uses publishedAt, falling back to reviewedAt then updatedAt', () => {
    expect(articleLd({ ...base, reviewedAt: new Date('2026-09-01') }).datePublished).toBe('2026-09-01T00:00:00.000Z');
    expect(articleLd(base).datePublished).toBe('2026-10-01T00:00:00.000Z');
    expect(articleLd({ ...base, publishedAt: new Date('2026-01-01') }).datePublished).toBe('2026-01-01T00:00:00.000Z');
  });

  it('includes modification date, image and author', () => {
    const ld = articleLd({ ...base, image: 'https://example.com/a.jpg' });
    expect(ld.dateModified).toBe('2026-10-01T00:00:00.000Z');
    expect(ld.image).toEqual(['https://example.com/a.jpg']);
    expect(ld.author).toEqual({ '@type': 'Person', name: 'Editorial team' });
  });
});

describe('touristDestinationLd', () => {
  it('includes geo coordinates', () => {
    const ld = touristDestinationLd({ name: 'Istanbul', description: 'd', url: 'u', lat: 41.01, lng: 28.98 });
    expect(ld.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 41.01, longitude: 28.98 });
  });
});

describe('websiteLd', () => {
  it('declares a search action', () => {
    const ld = websiteLd(site);
    expect(ld.potentialAction.target.urlTemplate).toBe('https://example.com/search/?q={search_term_string}');
  });
});

describe('jsonLdScript', () => {
  it('escapes < so content cannot close the script tag', () => {
    expect(jsonLdScript({ name: '</script>' })).toBe('{"name":"\\u003c/script>"}');
  });
});
