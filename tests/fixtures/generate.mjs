// Generates a deterministic content set for end-to-end tests into tests/fixtures/.generated.
// Fixture text is filler: it exists to exercise templates, not to inform travellers.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { seasonFor } from '../../src/lib/season.ts';

const out = join(dirname(fileURLToPath(import.meta.url)), '.generated');
const season = seasonFor(new Date());

const WORDS =
  'travellers often plan around the weather, the length of their stay and the pace they enjoy most, so this sample paragraph describes neighbourhoods, viewpoints, markets, museums, walking routes, local transport, quiet mornings, busy evenings and practical planning ideas in general terms'.split(
    ' ',
  );

function filler(words, seed) {
  const out = [];
  for (let i = 0; i < words; i++) out.push(WORDS[(i * 7 + seed) % WORDS.length]);
  const sentences = [];
  for (let i = 0; i < out.length; i += 15) {
    const s = out.slice(i, i + 15).join(' ');
    sentences.push(s.charAt(0).toUpperCase() + s.slice(1) + '.');
  }
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 5) paragraphs.push(sentences.slice(i, i + 5).join(' '));
  return paragraphs.join('\n\n');
}

const yaml = (value, indent = '') => {
  if (Array.isArray(value)) {
    if (!value.length) return ' []';
    return value.map((v) => `\n${indent}- ${typeof v === 'object' ? yaml(v, indent + '  ').trimStart() : JSON.stringify(v)}`).join('');
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.entries(value)
      .map(([k, v]) => {
        const nested = typeof v === 'object' && v !== null && !(v instanceof Date);
        return `\n${indent}${k}:${nested ? yaml(v, indent + '  ') : ` ${v instanceof Date ? v.toISOString().slice(0, 10) : JSON.stringify(v)}`}`;
      })
      .join('');
  }
  return ` ${JSON.stringify(value)}`;
};

const markdown = (data, body) => `---${yaml(data)}\n---\n\n${body}\n`;

const hero = (file, alt) => ({
  src: `../images/${file}`,
  alt,
  credit: { author: 'Test Fixture', sourceUrl: 'https://example.com/photo', license: 'CC BY 4.0' },
});

const reviewed = {
  author: 'fixture-editor',
  status: 'published',
  reviewedBy: 'Test Editor',
  reviewedAt: new Date('2026-10-01'),
  updatedAt: new Date('2026-10-01'),
};

const destination = (overrides) => ({
  tags: ['city'],
  bestTimeToVisit: {
    summary: 'Spring and autumn are mild.',
    spring: 'Mild days.',
    summer: 'Hot and busy.',
    autumn: 'Warm and calmer.',
    winter: 'Cool and quiet.',
  },
  suggestedDuration: '3 days',
  gettingThere: 'Arrive by [air or coach](https://example.com/transport).',
  gettingAround: 'Walk, or use local public transport.',
  attractions: [{ name: 'Old quarter', description: 'Narrow streets and viewpoints.' }],
  foodAndExperiences: 'Try local breakfasts and street food.',
  ...reviewed,
  ...overrides,
});

const files = {
  'authors/fixture-editor.yaml': 'name: Fixture Editor\nrole: Editor\nbio: Writes fixture content for automated tests.\n',

  'destinations/istanbul.md': markdown(
    destination({
      title: 'Istanbul',
      summary: 'A fixture destination for Istanbul used by the automated end-to-end tests of this site.',
      heroImage: hero('teal.jpg', 'Fixture image standing in for the Istanbul skyline'),
      region: 'marmara',
      interests: ['history', 'culture', 'food'],
      coordinates: { lat: 41.0082, lng: 28.9784 },
      featured: true,
      seasonalHighlight: { season, text: `A fixture highlight for ${season}.` },
    }),
    filler(340, 1),
  ),

  'destinations/cappadocia.md': markdown(
    destination({
      title: 'Cappadocia',
      summary: 'A fixture destination for Cappadocia, with valleys, rock-cut churches and balloon flights.',
      heroImage: hero('sand.jpg', 'Fixture image standing in for Cappadocia valleys'),
      region: 'central-anatolia',
      interests: ['history', 'nature'],
      coordinates: { lat: 38.6431, lng: 34.8289 },
      featured: true,
      relatedDestinations: ['istanbul'],
    }),
    filler(340, 2),
  ),

  'destinations/draft-town.md': markdown(
    destination({
      title: 'Draft Town',
      summary: 'A draft fixture destination that must never appear on the production site or in search.',
      heroImage: hero('rose.jpg', 'Fixture image for a draft destination'),
      region: 'aegean',
      interests: ['beaches'],
      coordinates: { lat: 38.42, lng: 27.14 },
      status: 'draft',
      reviewedBy: undefined,
      reviewedAt: undefined,
    }),
    filler(120, 3),
  ),

  'guides/getting-around-turkey.md': markdown(
    {
      title: 'Getting around Turkey',
      summary: 'A fixture guide to transport between cities, used by the automated end-to-end tests.',
      heroImage: hero('teal.jpg', 'Fixture image standing in for a coach station'),
      category: 'transport',
      tags: ['city'],
      relatedDestinations: ['istanbul'],
      factsToVerify: ['Fixture fact to verify'],
      ...reviewed,
    },
    `## Long-distance travel\n\n${filler(200, 4)}\n\n## City transport\n\n${filler(150, 5)}`,
  ),

  'guides/money-matters-draft.md': markdown(
    {
      title: 'Money matters draft',
      summary: 'A draft fixture guide about money that must never appear on the production site.',
      heroImage: hero('rose.jpg', 'Fixture image for a draft guide'),
      category: 'money',
      ...reviewed,
      status: 'draft',
    },
    filler(100, 6),
  ),

  'itineraries/classic-week.md': markdown(
    {
      title: 'A classic week in Turkey',
      summary: 'A fixture seven-day itinerary through Istanbul and Cappadocia for the automated tests.',
      heroImage: hero('sand.jpg', 'Fixture image for an itinerary'),
      days: 7,
      interests: ['history', 'culture'],
      stops: [
        { day: 1, destination: 'istanbul', title: 'Arrive in Istanbul', plan: 'Settle in and explore.' },
        { day: 4, destination: 'cappadocia', title: 'Fly to Cappadocia', plan: 'Valleys at sunset.' },
        { day: 7, destination: 'draft-town', title: 'Coastal finale', plan: 'Relax by the sea.' },
      ],
      ...reviewed,
    },
    filler(120, 7),
  ),

  'pages/about.md': markdown(
    {
      title: 'About',
      summary: 'A fixture about page describing the site, used by the automated end-to-end tests.',
      status: 'published',
      reviewedBy: 'Test Editor',
      reviewedAt: new Date('2026-10-01'),
      updatedAt: new Date('2026-10-01'),
    },
    filler(80, 8),
  ),

  'pages/privacy.md': markdown(
    {
      title: 'Privacy',
      summary: 'A fixture privacy page that is published but deliberately excluded from the sitemap.',
      status: 'published',
      reviewedBy: 'Test Editor',
      reviewedAt: new Date('2026-10-01'),
      updatedAt: new Date('2026-10-01'),
      inSitemap: false,
    },
    filler(80, 9),
  ),
};

await rm(out, { recursive: true, force: true });
for (const [path, content] of Object.entries(files)) {
  const target = join(out, path);
  await mkdir(dirname(target), { recursive: true });
  // Drop keys explicitly set to undefined (YAML has no undefined).
  await writeFile(target, content.replace(/^\s*\w+: undefined\n/gm, ''));
}

await mkdir(join(out, 'images'), { recursive: true });
for (const [name, background] of Object.entries({ 'teal.jpg': '#0b5e6b', 'sand.jpg': '#d8c3a0', 'rose.jpg': '#b5654f' })) {
  await sharp({ create: { width: 1600, height: 1000, channels: 3, background } }).jpeg().toFile(join(out, 'images', name));
}

console.log(`Fixtures written to ${out} (season: ${season})`);
