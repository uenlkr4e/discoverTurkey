export function robotsTxt(opts: { preview: boolean; site: URL | string }): string {
  if (opts.preview) return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', opts.site).href}\n`;
}
