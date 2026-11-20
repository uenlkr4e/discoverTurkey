import { describe, expect, it } from 'vitest';
import { formatDate, isoDate } from '../../src/lib/format';
import { renderMarkdown } from '../../src/lib/markdown';
import { robotsTxt } from '../../src/lib/robots';
import { seasonFor } from '../../src/lib/season';
import { sitemapXml } from '../../src/lib/sitemap';

describe('seasonFor', () => {
  it.each([
    ['2026-03-01', 'spring'],
    ['2026-05-31', 'spring'],
    ['2026-06-01', 'summer'],
    ['2026-09-15', 'autumn'],
    ['2026-11-30', 'autumn'],
    ['2026-12-01', 'winter'],
    ['2026-02-28', 'winter'],
  ])('%s is %s', (date, season) => {
    expect(seasonFor(new Date(`${date}T12:00:00Z`))).toBe(season);
  });
});

describe('robotsTxt', () => {
  it('blocks everything on previews', () => {
    expect(robotsTxt({ preview: true, site: 'https://example.com' })).toBe('User-agent: *\nDisallow: /\n');
  });

  it('allows crawling and lists the sitemap in production', () => {
    expect(robotsTxt({ preview: false, site: 'https://example.com' })).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n',
    );
  });
});

describe('sitemapXml', () => {
  it('renders escaped URLs with optional lastmod dates', () => {
    const xml = sitemapXml([
      { loc: 'https://example.com/' },
      { loc: 'https://example.com/a/?x=1&y=2', lastmod: new Date('2026-10-01T09:00:00Z') },
    ]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<url><loc>https://example.com/</loc></url>');
    expect(xml).toContain('<url><loc>https://example.com/a/?x=1&amp;y=2</loc><lastmod>2026-10-01</lastmod></url>');
  });
});

describe('format', () => {
  it('formats dates in UTC', () => {
    expect(formatDate(new Date('2026-11-20T00:00:00Z'))).toBe('20 November 2026');
    expect(isoDate(new Date('2026-11-20T23:00:00Z'))).toBe('2026-11-20');
  });
});

describe('renderMarkdown', () => {
  it('renders markdown paragraphs and links', () => {
    expect(renderMarkdown('Take the [tram](https://example.com).')).toBe(
      '<p>Take the <a href="https://example.com">tram</a>.</p>\n',
    );
  });
});
