import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Field {
  name: string;
  widget?: string;
  fields?: Field[];
  collection?: string;
  file?: string;
  value_field?: string;
}
interface Collection {
  name: string;
  folder?: string;
  fields?: Field[];
  files?: { name: string; file: string; fields: Field[] }[];
}

const config = parse(readFileSync('public/admin/config.yml', 'utf8')) as {
  media_folder: string;
  public_folder: string;
  collections: Collection[];
};
const byName = new Map(config.collections.map((c) => [c.name, c]));

// Must match the frontmatter keys in src/content.config.ts (plus `body`, the Markdown content).
const EDITORIAL = [
  'title', 'summary', 'heroImage', 'tags', 'seoTitle', 'seoDescription', 'author', 'status', 'reviewedBy',
  'reviewedAt', 'publishedAt', 'updatedAt', 'relatedDestinations', 'relatedGuides', 'relatedItineraries', 'body',
];
const EXPECTED: Record<string, string[]> = {
  destinations: [
    ...EDITORIAL, 'region', 'interests', 'bestTimeToVisit', 'suggestedDuration', 'coordinates', 'gettingThere',
    'gettingAround', 'attractions', 'foodAndExperiences', 'featured', 'seasonalHighlight',
  ],
  guides: [...EDITORIAL, 'category', 'factsToVerify'],
  itineraries: [...EDITORIAL, 'days', 'interests', 'stops'],
  pages: ['title', 'summary', 'body', 'status', 'reviewedBy', 'reviewedAt', 'updatedAt', 'inSitemap'],
  authors: ['name', 'role', 'bio'],
};

describe('CMS config', () => {
  for (const [name, keys] of Object.entries(EXPECTED)) {
    it(`edits exactly the schema fields of ${name}`, () => {
      const fields = byName.get(name)?.fields?.map((f) => f.name) ?? [];
      expect([...fields].sort()).toEqual([...keys].sort());
    });

    it(`stores ${name} where the content loader reads them`, () => {
      expect(byName.get(name)?.folder).toBe(`src/content/${name}`);
    });
  }

  it('edits nested objects with the schema keys', () => {
    const destination = byName.get('destinations')!.fields!;
    const sub = (name: string) => destination.find((f) => f.name === name)!.fields!.map((f) => f.name);
    expect(sub('heroImage')).toEqual(['src', 'alt', 'credit']);
    expect(sub('bestTimeToVisit')).toEqual(['summary', 'spring', 'summer', 'autumn', 'winter']);
    expect(sub('coordinates')).toEqual(['lat', 'lng']);
    expect(sub('seasonalHighlight')).toEqual(['season', 'text']);
    const stops = byName.get('itineraries')!.fields!.find((f) => f.name === 'stops')!.fields!.map((f) => f.name);
    expect(stops).toEqual(['day', 'destination', 'title', 'plan']);
  });

  it('stores images where entries reference them', () => {
    expect(existsSync(config.media_folder.slice(1))).toBe(true);
    for (const name of ['destinations', 'guides', 'itineraries']) {
      const c = byName.get(name) as Collection & { media_folder: string; public_folder: string };
      expect(c.media_folder).toBe('/src/content/images');
      // Relative to the entry file, matching how Astro resolves image() paths.
      expect(c.public_folder).toBe('../images');
    }
  });

  it('edits the taxonomy files the content loader reads', () => {
    const files = byName.get('taxonomies')!.files!;
    for (const file of files) {
      expect(existsSync(file.file)).toBe(true);
      expect(file.fields[0].fields!.map((f) => f.name)).toEqual(['id', 'name', 'description']);
    }
  });

  it('points every relation at an existing collection and list field', () => {
    const relations = config.collections.flatMap((c) =>
      (c.fields ?? []).flatMap((f) => [f, ...(f.fields ?? [])]).filter((f) => f.widget === 'relation'),
    );
    expect(relations.length).toBeGreaterThan(0);
    for (const relation of relations) {
      const target = byName.get(relation.collection!);
      expect(target, relation.name).toBeDefined();
      if (relation.file) {
        const file = target!.files!.find((f) => f.name === relation.file)!;
        expect(relation.value_field).toBe(`{{${file.fields[0].name}.*.id}}`);
      } else {
        expect(relation.value_field).toBe('{{slug}}');
      }
    }
  });
});
