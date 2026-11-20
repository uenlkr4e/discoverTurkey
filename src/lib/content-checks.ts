import { getCollection } from 'astro:content';
import { manualRelatedKeys, type ArticleEntry } from './collections';
import { wordCount } from './content';
import { entryKey } from './urls';
import { checkContent, type CheckEntry } from './validate';

let pending: Promise<void> | undefined;

/**
 * Runs cross-entry content checks once per build (on every request in dev) and
 * throws on errors, failing the build. Called from BaseLayout.
 */
export function assertContentValid(): Promise<void> {
  if (!pending || import.meta.env.DEV) pending = run();
  return pending;
}

function textOf(e: ArticleEntry): string {
  const parts = [e.body ?? ''];
  if (e.collection === 'destinations') {
    const d = e.data;
    parts.push(d.gettingThere, d.gettingAround, d.foodAndExperiences, ...d.attractions.map((a) => a.description));
  }
  if (e.collection === 'itineraries') parts.push(...e.data.stops.map((s) => s.plan));
  return parts.join('\n');
}

function linksOf(e: ArticleEntry): string[] {
  const stops = e.collection === 'itineraries' ? e.data.stops.map((s) => entryKey(s.destination)) : [];
  return [...new Set([...manualRelatedKeys(e), ...stops])];
}

async function run(): Promise<void> {
  const [d, g, i] = await Promise.all([
    getCollection('destinations'),
    getCollection('guides'),
    getCollection('itineraries'),
  ]);
  const entries: CheckEntry[] = [...d, ...g, ...i].map((e) => ({
    key: entryKey(e),
    collection: e.collection,
    title: e.data.title,
    seoTitle: e.data.seoTitle,
    description: e.data.seoDescription ?? e.data.summary,
    status: e.data.status,
    reviewedAt: e.data.reviewedAt,
    words: wordCount(textOf(e)),
    links: linksOf(e),
  }));

  const { errors, warnings } = checkContent(entries, new Date());
  for (const warning of warnings) console.warn(`[content] ${warning}`);
  if (errors.length) throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
}
