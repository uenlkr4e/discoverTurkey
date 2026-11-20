import { describe, expect, it } from 'vitest';
import { pickRelated, relatedScore, type RelatedCandidate } from '../../src/lib/related';

const c = (key: string, region: string | undefined, interests: string[], tags: string[] = []): RelatedCandidate => ({
  key,
  region,
  interests,
  tags,
});

const current = c('destinations/izmir', 'aegean', ['history', 'food'], ['coast']);

describe('relatedScore', () => {
  it('weights region 3, interests 2 each, tags 1 each', () => {
    expect(relatedScore(current, c('destinations/ephesus', 'aegean', ['history'], ['coast']))).toBe(6);
    expect(relatedScore(current, c('guides/money', undefined, [], []))).toBe(0);
  });
});

describe('pickRelated', () => {
  const candidates = [
    current,
    c('destinations/ephesus', 'aegean', ['history']),
    c('destinations/istanbul', 'marmara', ['history', 'food']),
    c('guides/money', undefined, []),
    c('itineraries/aegean-week', undefined, ['history'], ['coast']),
  ];

  it('puts manual picks first, then highest scores, excluding self', () => {
    expect(pickRelated(current, ['guides/money'], candidates, 3)).toEqual([
      'guides/money',
      'destinations/ephesus',
      'destinations/istanbul',
    ]);
  });

  it('drops manual picks that are not visible candidates and de-duplicates', () => {
    expect(pickRelated(current, ['destinations/draft', 'guides/money', 'guides/money'], candidates, 2)).toEqual([
      'guides/money',
      'destinations/ephesus',
    ]);
  });

  it('never includes zero-score automatic picks', () => {
    expect(pickRelated(current, [], candidates, 10)).not.toContain('guides/money');
  });

  it('breaks score ties alphabetically for stable output', () => {
    const tie = [c('b', 'aegean', []), c('a', 'aegean', [])];
    expect(pickRelated(c('x', 'aegean', []), [], tie, 2)).toEqual(['a', 'b']);
  });
});
