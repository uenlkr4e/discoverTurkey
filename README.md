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
| `PUBLIC_ADS_ENABLED` | `true` to render ad slots and load AdSense; anything else turns ads off |
| `PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID, `ca-pub-…`. Required when ads are enabled; also generates `/ads.txt` |
| `PUBLIC_AD_SLOT_INCONTENT`, `PUBLIC_AD_SLOT_SIDEBAR`, `PUBLIC_AD_SLOT_FOOTER` | AdSense ad unit IDs; a placement without an ID is not rendered |
| `PUBLIC_CONSENT_MODE` | `strict` (default): consent is denied everywhere and ads are non-personalized until the consent platform records consent. `regional`: denied by default only in the EEA, UK and Switzerland. Switch only after confirming it suits your audiences |
| `PUBLIC_GA4_ID` | GA4 measurement ID, `G-…`; analytics is off when unset |

Malformed IDs fail the build. Changing any of these needs a redeploy, but no content changes.

## Ads, consent and analytics

- **Placements:** one in-content unit in articles of 600+ words (before the third, or second, section heading), a sidebar unit beside articles on screens 1024px and wider, and a footer unit on articles and the homepage. No ads on search, legal pages or in navigation.
- **Layout stability:** every slot reserves its full size before loading, is labelled "Advertisement", and only loads when it nears the viewport.
- **Consent:** Google Consent Mode v2 defaults are set before any Google tag loads. The consent banner itself is Google Privacy & messaging, configured in the AdSense dashboard; the footer "Privacy settings" link appears once it is active.
- **GA4 events:** `ad_slot_rendered`, `ad_slot_viewable`, `search`, `outbound_click`, `share`.

## Documentation

- [Content workflow](docs/content-workflow.md): editing in the CMS, review and publishing, image licensing
- [Deployment](docs/deployment.md): Cloudflare Pages, environment variables, CMS sign-in, CI
- [Ads, consent and analytics](docs/ads-and-consent.md): AdSense setup, consent message, GA4
- [Maintenance](docs/maintenance.md): routine tasks, upgrades, extending the site, troubleshooting
