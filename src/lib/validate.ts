import type { Status } from './content';
import { isoDate } from './format';

export interface CheckEntry {
  key: string;
  collection: string;
  /** Titles and descriptions only need to be unique within a language. Defaults to "en". */
  locale?: string;
  title: string;
  seoTitle?: string;
  /** The effective meta description (seoDescription ?? summary). */
  description: string;
  status: Status;
  reviewedAt?: Date;
  words: number;
  /** Keys of entries this one links to (related content, itinerary stops). */
  links: string[];
  /** Editor placeholders still present (see findPlaceholders). */
  placeholders?: string[];
}

/** Markers used in drafts for details the site owner must supply. */
export function findPlaceholders(text: string): string[] {
  return text.match(/\[TO COMPLETE[^\]]*\]|\bPENDING\b/g) ?? [];
}

export interface CheckResult {
  errors: string[];
  warnings: string[];
}

export const MIN_WORDS = 300;
const STALE_MS = 365 * 24 * 60 * 60 * 1000;
const WORD_CHECKED = new Set(['destinations', 'guides']);

function duplicates(entries: CheckEntry[], valueOf: (e: CheckEntry) => string): [string, string[]][] {
  const groups = new Map<string, { value: string; keys: string[] }>();
  for (const e of entries) {
    const value = valueOf(e);
    const norm = `${e.locale ?? 'en'}:${value.trim().toLowerCase()}`;
    const group = groups.get(norm) ?? { value, keys: [] };
    group.keys.push(e.key);
    groups.set(norm, group);
  }
  return [...groups.values()].filter((g) => g.keys.length > 1).map((g) => [g.value, g.keys]);
}

/** Cross-entry checks that the per-entry zod schemas cannot express. */
export function checkContent(entries: CheckEntry[], now: Date): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const published = entries.filter((e) => e.status === 'published');
  const publishedKeys = new Set(published.map((e) => e.key));

  for (const [title, keys] of duplicates(published, (e) => e.seoTitle ?? e.title)) {
    errors.push(`Duplicate title "${title}": ${keys.join(', ')}`);
  }
  for (const [description, keys] of duplicates(published, (e) => e.description)) {
    errors.push(`Duplicate meta description "${description}": ${keys.join(', ')}`);
  }

  for (const e of published) {
    if (e.placeholders?.length) {
      errors.push(`${e.key} still contains placeholder text: ${[...new Set(e.placeholders)].join(', ')}`);
    }
    if (WORD_CHECKED.has(e.collection) && e.words < MIN_WORDS) {
      errors.push(`${e.key} has ${e.words} words; published destinations and guides need at least ${MIN_WORDS}`);
    }
    if (e.reviewedAt && now.getTime() - e.reviewedAt.getTime() > STALE_MS) {
      warnings.push(`${e.key} was last reviewed ${isoDate(e.reviewedAt)}; re-review it`);
    }
    for (const link of e.links) {
      if (!publishedKeys.has(link)) {
        warnings.push(`${e.key} links to ${link}, which is not published; the link stays hidden until it is`);
      }
    }
  }

  return { errors, warnings };
}
