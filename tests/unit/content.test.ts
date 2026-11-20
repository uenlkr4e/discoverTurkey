import { describe, expect, it } from 'vitest';
import { isPublished, isVisible, wordCount } from '../../src/lib/content';

describe('publication gate', () => {
  it('treats only published entries as published', () => {
    expect(isPublished({ status: 'published' })).toBe(true);
    expect(isPublished({ status: 'draft' })).toBe(false);
    expect(isPublished({ status: 'in-review' })).toBe(false);
  });

  it('hides unpublished entries unless drafts are shown', () => {
    expect(isVisible({ status: 'draft' }, false)).toBe(false);
    expect(isVisible({ status: 'in-review' }, false)).toBe(false);
    expect(isVisible({ status: 'draft' }, true)).toBe(true);
    expect(isVisible({ status: 'published' }, false)).toBe(true);
  });
});

describe('wordCount', () => {
  it('counts words, ignoring markdown punctuation', () => {
    expect(wordCount('## The Blue Mosque\n\n- It’s *free* to enter.')).toBe(7);
  });

  it('counts Turkish words with diacritics as single words', () => {
    expect(wordCount('İzmir, Kaş ve Ölüdeniz')).toBe(4);
  });

  it('returns 0 for empty text', () => {
    expect(wordCount('   ')).toBe(0);
  });
});
