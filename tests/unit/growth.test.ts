import { describe, expect, it } from 'vitest';
import { pinOverlaySvg, pinPath, pinsCsv, wrapText } from '../../src/lib/pins';
import { parseVerification } from '../../src/lib/verification';

describe('wrapText', () => {
  it('wraps on word boundaries', () => {
    expect(wrapText('A classic week in Istanbul and Cappadocia', 18)).toEqual([
      'A classic week in',
      'Istanbul and',
      'Cappadocia',
    ]);
  });

  it('truncates with an ellipsis after the line limit', () => {
    expect(wrapText('one two three four five six', 8, 2)).toEqual(['one two', 'three…']);
  });
});

describe('pins', () => {
  it('names pin files by collection and id', () => {
    expect(pinPath('guides', 'money-and-payments')).toBe('/pins/guides-money-and-payments.jpg');
  });

  it('escapes text in the overlay', () => {
    const svg = pinOverlaySvg({ eyebrow: 'Tips', title: 'Cards & cash', summary: '<b>', footer: 'x', credit: 'y' });
    expect(svg).toContain('Cards &amp; cash');
    expect(svg).not.toContain('<b>');
  });

  it('writes Pinterest bulk-upload CSV with quoted cells', () => {
    const csv = pinsCsv([
      {
        title: 'Antalya',
        mediaUrl: 'https://example.com/pins/a.jpg',
        board: 'Turkey destinations',
        description: 'Old town, "beaches", ruins',
        link: 'https://example.com/destinations/antalya/',
        keywords: ['beach', 'roman'],
      },
    ]);
    const [header, row] = csv.trim().split('\n');
    expect(header).toBe('Title,Media URL,Pinterest board,Thumbnail,Description,Link,Publish date,Keywords');
    expect(row).toBe(
      'Antalya,https://example.com/pins/a.jpg,Turkey destinations,,"Old town, ""beaches"", ruins",https://example.com/destinations/antalya/,,"beach, roman"',
    );
  });
});

describe('parseVerification', () => {
  it('reads verification codes and ignores empty ones', () => {
    expect(parseVerification({ PUBLIC_GOOGLE_SITE_VERIFICATION: 'abc_DEF-123', PUBLIC_PINTEREST_DOMAIN_VERIFY: '' })).toEqual({
      google: 'abc_DEF-123',
      pinterest: undefined,
    });
  });

  it('rejects a pasted meta tag', () => {
    expect(() => parseVerification({ PUBLIC_PINTEREST_DOMAIN_VERIFY: '<meta name="p:domain_verify" content="x">' })).toThrow(
      /PUBLIC_PINTEREST_DOMAIN_VERIFY/,
    );
  });
});
