import type { APIRoute } from 'astro';
import { showDrafts } from '../lib/collections';
import { robotsTxt } from '../lib/robots';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ preview: showDrafts, site: site! }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
