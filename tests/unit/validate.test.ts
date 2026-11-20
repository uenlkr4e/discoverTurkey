import { describe, expect, it } from 'vitest';
import { checkContent, type CheckEntry } from '../../src/lib/validate';

const now = new Date('2026-11-20T00:00:00Z');
const entry = (over: Partial<CheckEntry>): CheckEntry => ({
  key: 'destinations/istanbul',
  collection: 'destinations',
  title: 'Istanbul',
  description: 'A city on two continents.',
  status: 'published',
  reviewedAt: new Date('2026-11-01'),
  words: 500,
  links: [],
  ...over,
});

describe('checkContent', () => {
  it('passes clean content', () => {
    expect(checkContent([entry({})], now)).toEqual({ errors: [], warnings: [] });
  });

  it('errors on duplicate titles among published entries', () => {
    const { errors } = checkContent(
      [entry({}), entry({ key: 'guides/istanbul', collection: 'guides', description: 'Other.' })],
      now,
    );
    expect(errors).toEqual(['Duplicate title "Istanbul": destinations/istanbul, guides/istanbul']);
  });

  it('compares the SEO title when one is set', () => {
    const { errors } = checkContent(
      [entry({}), entry({ key: 'guides/istanbul', seoTitle: 'Istanbul transport', description: 'Other.' })],
      now,
    );
    expect(errors).toEqual([]);
  });

  it('errors on duplicate meta descriptions', () => {
    const { errors } = checkContent([entry({}), entry({ key: 'destinations/b', title: 'B' })], now);
    expect(errors).toEqual([
      'Duplicate meta description "A city on two continents.": destinations/istanbul, destinations/b',
    ]);
  });

  it('ignores duplicates when one side is a draft', () => {
    const { errors } = checkContent([entry({}), entry({ key: 'destinations/b', status: 'draft' })], now);
    expect(errors).toEqual([]);
  });

  it('errors on thin published destinations and guides, but not itineraries', () => {
    const { errors } = checkContent(
      [
        entry({ words: 120 }),
        entry({ key: 'itineraries/x', collection: 'itineraries', title: 'X', description: 'x', words: 50 }),
      ],
      now,
    );
    expect(errors).toEqual([
      'destinations/istanbul has 120 words; published destinations and guides need at least 300',
    ]);
  });

  it('warns when a review is older than 12 months', () => {
    const { warnings } = checkContent([entry({ reviewedAt: new Date('2025-11-01') })], now);
    expect(warnings).toEqual(['destinations/istanbul was last reviewed 2025-11-01; re-review it']);
  });

  it('warns when a published entry links to an unpublished one', () => {
    const { warnings } = checkContent(
      [
        entry({ links: ['destinations/draft'] }),
        entry({ key: 'destinations/draft', title: 'D', description: 'd', status: 'draft' }),
      ],
      now,
    );
    expect(warnings).toEqual([
      'destinations/istanbul links to destinations/draft, which is not published; the link stays hidden until it is',
    ]);
  });
});
