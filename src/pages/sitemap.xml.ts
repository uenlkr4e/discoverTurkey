import type { APIRoute } from 'astro';
import { getArticles, getListingPaths, getPages } from '../lib/collections';
import { isPublished } from '../lib/content';
import { sitemapXml, type SitemapUrl } from '../lib/sitemap';
import { hrefFor } from '../lib/urls';

// Built from the same publication-gated getters as the pages, so drafts can never appear.
export const GET: APIRoute = async ({ site }) => {
  const [paths, articles, pages] = await Promise.all([getListingPaths(), getArticles(), getPages()]);
  const urls: SitemapUrl[] = [
    ...paths.map((path) => ({ loc: new URL(path, site).href })),
    ...articles
      .filter((e) => isPublished(e.data))
      .map((e) => ({ loc: new URL(hrefFor(e), site).href, lastmod: e.data.updatedAt })),
    ...pages
      .filter((p) => isPublished(p.data) && p.data.inSitemap)
      .map((p) => ({ loc: new URL(hrefFor(p), site).href, lastmod: p.data.updatedAt })),
  ];
  return new Response(sitemapXml(urls), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
