# Discover Turkey

A statically generated travel discovery site for Turkey, built with [Astro](https://astro.build) 7.
Design spec: [`docs/superpowers/specs/2026-11-20-discover-turkey-site-design.md`](docs/superpowers/specs/2026-11-20-discover-turkey-site-design.md).

## Requirements

- Node.js 24 (see `.nvmrc`; Astro 7 needs Node ≥ 22.23.4)

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:4321 (search needs a build, see below) |
| `npm run build` | Production build into `dist/`, then the Pagefind search index |
| `npm run preview` | Serve `dist/` locally, including search |
| `npm run check` | Type-check Astro and TypeScript files |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Builds the fixture content and runs Playwright end-to-end and accessibility tests |

Run `npx playwright install chromium` once before the first end-to-end run.

## Content

Content lives in `src/content/` as Markdown with YAML frontmatter; the schemas in
`src/content.config.ts` are the contract and the build fails on invalid entries.
Regions, interests and guide categories are in `src/data/*.yaml`.

Only entries with `status: published` plus `reviewedBy` and `reviewedAt` appear on the site.
Set `PUBLIC_ENV=preview` to also render drafts (with a draft banner and `noindex`), for preview deployments.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Canonical origin, e.g. `https://www.example.com` (defaults to `http://localhost:4321`) |
| `PUBLIC_ENV` | `preview` renders drafts and blocks crawlers; anything else is production |
| `CONTENT_DIR` | Content root override, used by the end-to-end tests |
