# Maintenance

## Regular tasks

| When | Task |
| --- | --- |
| Every deploy | Read the build log for `[content]` warnings: stale reviews and links to unpublished pages. |
| Monthly | Check Search Console for crawl errors and pages "Crawled – currently not indexed"; improve or merge thin pages. |
| Monthly | Run `npm outdated` and update dependencies on a branch; let CI verify. |
| Yearly, per page | Re-review every published page (see [content workflow](content-workflow.md)) and update **Review date**. |
| After travel-rule changes | Re-check affected guides immediately (visas, entry rules, transport). |

## Updating dependencies

```sh
git switch -c chore/deps
npm outdated
npm update                      # within semver ranges
npm install astro@latest        # major upgrades: read the Astro upgrade guide first
npm run check && npm test && npm run build && npm run test:e2e
```

The CMS is loaded from a pinned CDN URL in `public/admin/index.html` (`@sveltia/cms@<version>`). To upgrade:

1. Read the Sveltia CMS release notes.
2. Bump the version in that URL.
3. Check the sign-in screen and an entry editor on a preview deployment before merging.

## Adding things

**A region, interest or guide category.**
1. Add it in the CMS under **Regions, interests and categories**, or in `src/data/*.yaml`.
2. Give it a lower-case, hyphenated `id` and a 50–160 character description.

Its page appears once it has published content.

**A new destination, guide or itinerary.** Use the CMS (see [content workflow](content-workflow.md)).

**A new content field.**
1. Add it to the zod schema in `src/content.config.ts`.
2. Add it to `public/admin/config.yml`.
3. Add it to the field list in `tests/unit/cms-config.test.ts`.
4. Render it in the relevant template under `src/pages/`.

**Turkish (or another language) later.**
- **URLs.** Pages currently live at the root (`/destinations/istanbul/`). Add the new language under a prefix such as `/tr/`, using Astro's i18n routing.
- **Content.** Add a `locale` field, or parallel content folders.
- **Head tags.** Emit `hreflang` links in `BaseLayout.astro`.
- **CMS.** Sveltia CMS supports multilingual entries; see its i18n documentation.

## Where things live

| Path | Purpose |
| --- | --- |
| `src/content/` | Markdown content and images |
| `src/data/` | Regions, interests, guide categories |
| `src/content.config.ts` | Content schemas (the contract the build enforces) |
| `src/lib/` | Pure logic: publication gate, validation, SEO, related content, ads and consent config |
| `src/pages/` | Routes and templates |
| `src/layouts/`, `src/components/` | Shared layout and UI |
| `src/scripts/` | Browser code: ads loader, analytics events, privacy settings, sharing |
| `public/admin/` | CMS |
| `src/lib/headers.ts` | Security and caching headers on Cloudflare (built as `/_headers`) |
| `tests/unit/`, `tests/e2e/` | Vitest and Playwright tests; `tests/fixtures/generate.mjs` builds the e2e content |

## Troubleshooting

- **Build fails with "Content validation failed".** The message lists each problem: a duplicate title or description, or a published page under 300 words. Fix the entries named.
- **Build fails with a schema error.** Usually a missing required field, an over-long summary, or a reference to an entry that doesn't exist. The error names the file and field.
- **Search finds nothing locally.** The search index is generated after the build; use `npm run build && npm run preview`, not `npm run dev`.
- **A page is missing on the live site.** Check that its status is Published, with a reviewer and review date, and that the change was merged to `main`.
- **CMS shows a blank page.** Cloudflare's Rocket Loader can break it. Keep Rocket Loader off, or keep `data-cfasync="false"` on the CMS script tag.
