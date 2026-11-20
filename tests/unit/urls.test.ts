import { describe, expect, it } from 'vitest';
import { entryKey, hrefFor } from '../../src/lib/urls';

describe('hrefFor', () => {
  it('builds destination, itinerary and page URLs', () => {
    expect(hrefFor({ collection: 'destinations', id: 'istanbul', data: {} })).toBe('/destinations/istanbul/');
    expect(hrefFor({ collection: 'itineraries', id: 'classic-week', data: {} })).toBe('/itineraries/classic-week/');
    expect(hrefFor({ collection: 'pages', id: 'about', data: {} })).toBe('/about/');
  });

  it('nests guides under their category', () => {
    expect(
      hrefFor({ collection: 'guides', id: 'getting-around', data: { category: { id: 'transport' } } }),
    ).toBe('/guides/transport/getting-around/');
  });

  it('throws for a guide without a category', () => {
    expect(() => hrefFor({ collection: 'guides', id: 'x', data: {} })).toThrow(/category/);
  });
});

describe('entryKey', () => {
  it('joins collection and id', () => {
    expect(entryKey({ collection: 'guides', id: 'money' })).toBe('guides/money');
  });
});
