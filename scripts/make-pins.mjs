// Generates Pinterest pin images (1000×1500) for published destinations, guides and itineraries
// into public/pins/, and pins.csv for Pinterest's bulk upload.
// Usage: SITE_URL=https://www.example.com npm run pins
// Run it on your own computer after publishing new pages, then commit public/pins/.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { parse } from 'yaml';
import { SITE } from '../src/config/site.ts';
import { PIN_BOARDS, PIN_HEIGHT, PIN_WIDTH, pinOverlaySvg, pinPath, pinsCsv } from '../src/lib/pins.ts';
import { hrefFor } from '../src/lib/urls.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const content = join(root, 'src/content');
const outDir = join(root, 'public/pins');
const siteUrl = process.env.SITE_URL;
const domain = siteUrl ? new URL(siteUrl).hostname.replace(/^www\./, '') : SITE.name;

const EYEBROW = {
  destinations: () => 'Turkey travel guide',
  guides: () => 'Turkey travel tips',
  itineraries: (d) => `${d.days}-day Turkey itinerary`,
};

async function entries(collection) {
  const dir = join(content, collection);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const out = [];
  for (const file of files) {
    const text = await readFile(join(dir, file), 'utf8');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) continue;
    const data = parse(match[1]);
    if (data.status !== 'published') continue;
    out.push({ collection, id: file.replace(/\.md$/, ''), file: join(dir, file), data });
  }
  return out;
}

async function makePin(entry) {
  const { collection, id, data } = entry;
  const photo = resolve(dirname(entry.file), data.heroImage.src);
  const overlay = pinOverlaySvg({
    eyebrow: EYEBROW[collection](data),
    title: data.title,
    summary: data.summary,
    footer: domain,
    credit: `Photo: ${data.heroImage.credit.author}, ${data.heroImage.credit.license} (cropped, text added)`,
  });
  await sharp(photo)
    .rotate()
    .resize(PIN_WIDTH, PIN_HEIGHT, { fit: 'cover', position: sharp.strategy.attention })
    .composite([{ input: Buffer.from(overlay) }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(root, 'public', pinPath(collection, id)));
}

const all = (await Promise.all(['destinations', 'guides', 'itineraries'].map(entries))).flat();
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
for (const entry of all) {
  await makePin(entry);
  console.log(`pin: ${pinPath(entry.collection, entry.id)}`);
}

if (siteUrl) {
  const rows = all.map((e) => ({
    title: e.data.seoTitle ?? e.data.title,
    mediaUrl: new URL(pinPath(e.collection, e.id), siteUrl).href,
    board: PIN_BOARDS[e.collection],
    description: e.data.summary,
    // hrefFor needs the guide category as a reference object, as Astro provides it.
    link: new URL(hrefFor({ collection: e.collection, id: e.id, data: { category: { id: e.data.category } } }), siteUrl).href,
    keywords: e.data.tags ?? [],
  }));
  await writeFile(join(root, 'pins.csv'), pinsCsv(rows));
  console.log(`\n${all.length} pins written to public/pins/, and pins.csv for bulk upload.`);
} else {
  console.log(`\n${all.length} pins written to public/pins/. Set SITE_URL to also write pins.csv for bulk upload.`);
}
