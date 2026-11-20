import type { APIRoute } from 'astro';
import { adsTxt } from '../lib/ads';
import { headersFile } from '../lib/headers';
import { ads, newsletter } from '../lib/site-env';

const FILES: Record<string, () => string> = {
  // Cloudflare Pages reads security headers from this file in the build output.
  _headers: () => headersFile({ formOrigins: newsletter ? [newsletter.origin] : [] }),
  // ads.txt exists only when ads are configured.
  ...(ads ? { 'ads.txt': () => adsTxt(ads) } : {}),
};

export function getStaticPaths() {
  return Object.keys(FILES).map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(FILES[params.file!](), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
