import type { APIRoute } from 'astro';
import { LOCALE_CODES } from '../i18n/locales';
import { getArticles, getListingPaths, getPages } from '../lib/collections';
import { isPublished } from '../lib/content';
import { sitemapXml, type SitemapUrl } from '../lib/sitemap';
import { hrefFor } from '../lib/urls';

// Built from the same publication-gated getters as the pages, so drafts can never appear.
// Language versions are linked to each other with hreflang tags in each page's <head>.
export const GET: APIRoute = async ({ site }) => {
  const perLocale = await Promise.all(
    LOCALE_CODES.map(async (locale) => {
      const [paths, articles, pages] = await Promise.all([
        getListingPaths(locale),
        getArticles(locale),
        getPages(locale),
      ]);
      return [
        ...paths.map((path) => ({ loc: new URL(path, site).href })),
        ...articles
          .filter((e) => isPublished(e.data))
          .map((e) => ({ loc: new URL(hrefFor(e), site).href, lastmod: e.data.updatedAt })),
        ...pages
          .filter((p) => isPublished(p.data) && p.data.inSitemap)
          .map((p) => ({ loc: new URL(hrefFor(p), site).href, lastmod: p.data.updatedAt })),
      ];
    }),
  );
  const urls: SitemapUrl[] = perLocale.flat();
  return new Response(sitemapXml(urls), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
