import type { APIRoute } from 'astro';
import { adsTxt } from '../lib/ads';
import { ads } from '../lib/site-env';

// ads.txt exists only when ads are configured.
export function getStaticPaths() {
  return ads ? [{ params: { file: 'ads.txt' } }] : [];
}

export const GET: APIRoute = () =>
  new Response(adsTxt(ads!), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
