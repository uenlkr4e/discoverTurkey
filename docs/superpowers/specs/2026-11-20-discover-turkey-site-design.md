# Discover Turkey — Site Design

Date: 2026-11-20
Status: Approved design, pending implementation plan

## 1. Goal

A content-rich, ad-supported travel discovery site for Turkey, optimized for organic search. Visitors explore destinations by region and interest, read practical guides and itineraries, and move between related content. Revenue comes from Google AdSense, served only within a consent-compliant setup.

## 2. Decisions

| Topic | Decision |
|---|---|
| Site name | "Discover Turkey" (config value) |
| Language | English only at launch; URL structure and schema allow adding `/tr/` + hreflang later |
| Launch destinations | Istanbul, Cappadocia, İzmir, Antalya, Ephesus, Turquoise Coast |
| Content authorship | Claude drafts all launch content as `draft`; a named human editor reviews and publishes |
| Images | Openly licensed (Wikimedia Commons / Unsplash) with recorded author, source and license, credited on page; editor approves each; replaceable with owned photos |
| Stack | Astro (static output), TypeScript, content collections with zod schemas, `astro:assets`, Pagefind |
| CMS | Git-based: Sveltia CMS (Decap-compatible config) at `/admin`, editing Markdown in the repo |
| Hosting | Cloudflare Pages (HTTPS, branch previews, per-environment variables) |
| Consent | Google Privacy & Messaging (certified CMP, TCF v2.2) + Google Consent Mode v2, default denied |
| Analytics | GA4 via gtag under Consent Mode, linked to AdSense |

## 3. Architecture

```
src/content/                 Markdown + frontmatter (the CMS writes here)
  destinations/ guides/ itineraries/ authors/
src/data/                    regions.yaml, interests.yaml, guide-categories.yaml
src/content.config.ts        zod schemas: the content contract
src/layouts/                 BaseLayout (head, SEO, consent bootstrap), ArticleLayout
src/components/              Header/Nav, Breadcrumbs, Card, AdSlot, RelatedContent,
                             FactBox, ImageCredit, MapLinks, SearchBox, ShareButtons,
                             ConsentBoot, ReviewedBy, DraftBanner
src/pages/                   routes (below)
src/lib/
  content.ts                 getPublished(), related-content scoring, taxonomy helpers
  seo.ts                     title/meta/canonical, JSON-LD builders
  ads.ts                     env → typed ad config
  validate.ts                cross-entry build checks
public/admin/                CMS index.html + config.yml
```

### Routes

- `/` home
- `/destinations/`, `/destinations/[slug]/`
- `/regions/[region]/`, `/interests/[interest]/` (browse pages)
- `/guides/`, `/guides/[category]/`, `/guides/[category]/[slug]/`
- `/itineraries/`, `/itineraries/[slug]/`
- `/search/`
- `/about/`, `/editorial-policy/`, `/privacy/`, `/cookies/`
- `/sitemap-index.xml`, `/robots.txt`, `/ads.txt`

All URLs are lowercase, hyphenated, and end with a trailing slash.

### Publication gate

All page and listing queries go through `getPublished(collection)`. An entry is returned only when `status === "published"` and both `reviewedBy` and `reviewedAt` are set. A published entry that lacks either field fails the build.

- **Production builds** (`CF_PAGES_BRANCH === "main"` or `PUBLIC_ENV=production`): drafts and in-review entries are excluded entirely.
- **Preview builds** (any other branch): those entries are included, but each one shows a `DraftBanner` and carries `<meta name="robots" content="noindex">`. The whole preview site also sends `robots.txt` with `Disallow: /`.

## 4. Content model

### Shared fields (destination, guide, itinerary)

- `title`, `slug` (from filename)
- `summary`: ≤160 chars; the default meta description
- body (Markdown)
- `heroImage`: `{ src, alt (required, non-empty), credit: { author, sourceUrl, license } }`
- `tags[]`
- `seoTitle?`, `seoDescription?`
- `author`: a reference to `authors/`, which holds `{ name, role, bio }`
- `status`: `draft | in-review | published`
- `reviewedBy?`, `reviewedAt?`, `updatedAt`
- `related[]`: references to other entries, checked at build time

### Destination

- `region`: a reference to `regions.yaml`
- `interests[]`: references to `interests.yaml`
- `bestTimeToVisit`: `{ spring, summer, autumn, winter }` short notes plus an overall recommendation
- `suggestedDuration`: e.g. "3–4 days"
- `coordinates`: `{ lat, lng }`, rendered as Google Maps and OpenStreetMap links (no embedded map)
- `gettingThere`, `gettingAround`: Markdown strings
- `attractions[]`: `{ name, description, image? }`
- `foodAndExperiences`: Markdown string
- `featured`: boolean
- `seasonalHighlight?`: `{ season, text }`, used on the homepage

### Guide

- `category`: one of transport, money, connectivity, etiquette, safety, seasons (editable list)
- `factsToVerify[]`: the volatile claims a reviewer must check before publishing

### Itinerary

- `days`: number
- `interests[]`
- `stops[]`: `{ day, destination (ref), title, plan }`

### Taxonomies

- **Regions:** Marmara, Aegean, Mediterranean, Central Anatolia, Black Sea, Eastern Anatolia, Southeastern Anatolia.
- **Interests:** history, beaches, nature, food, culture, family.

A region or interest browse page is generated only when it has at least one published entry.

### Volatile facts policy

Drafts never state prices, opening hours, fares, visa fees or entry rules as fixed facts. They describe the general shape, link to the official source (e.g. the e-Visa portal, the Müze Kart site, Istanbulkart, the ministry of culture's museum site), and list each such claim in `factsToVerify`. Practical guides render "Last reviewed {date} by {editor}" and a "Check official sources before you travel" note.

### Related content

The manual `related[]` entries come first. The remaining related slots (up to 4 total) are filled by score: same region +3, each shared interest +2, each shared tag +1. Only published entries are considered, and the current page is excluded.

## 5. Initial content set (all drafted as `draft`)

- **Destinations (6):**
  - Istanbul
  - Cappadocia
  - İzmir
  - Antalya
  - Ephesus: attraction-focused, linked from İzmir
  - Turquoise Coast: region-style page covering Fethiye, Kaş and Ölüdeniz, cross-linked with Antalya
- **Guides (6):** Getting around Turkey; Money and payments; SIM cards, eSIMs and Wi-Fi; Etiquette and customs; Staying safe; When to visit Turkey (seasons).
- **Itineraries (3):** 7 days classic (Istanbul–Cappadocia); 10 days history (Istanbul–İzmir/Ephesus–Cappadocia); 7 days coast (Antalya–Turquoise Coast).
- **Pages:** About; Editorial policy (how content is researched and reviewed, image licensing, ad disclosure); Privacy; Cookies.

The Privacy and Cookies pages are drafted as templates. The site owner must review them, and legal review is recommended.

## 6. Homepage

- **Hero:** value proposition ("Discover where to go and what to do in Turkey"), a search field, and the hero image.
- **Featured destinations:** cards for destinations with `featured: true`.
- **Seasonal recommendations:** destinations whose `seasonalHighlight.season` matches the current season, computed at build time. A weekly scheduled rebuild keeps this current.
- **Browse by interest:** six interest tiles.
- **Browse by region:** region list showing only regions with published content.
- **Planning guides and popular itineraries:** card rows.
- **Ads:** none in the hero. One footer unit only.

## 7. Search and navigation

- **Header:** logo, plus nav items Destinations, Experiences (interests), Itineraries, Travel Tips (guides), and a search icon/link. On mobile this becomes a disclosure menu: a button with `aria-expanded`, Esc closes it, and focus returns to the button.
- **Breadcrumbs:** on every page except home, rendered as `nav[aria-label="Breadcrumb"]` and emitted as BreadcrumbList JSON-LD.
- **Search:**
  - Pagefind indexes the article body region only (`data-pagefind-body`), with filters for type (destination, guide, itinerary), region and interest.
  - `/search/?q=` reads the query, renders results with `aria-live="polite"`, and works with keyboard only.
  - The header search field submits to `/search/`.
- **Browse pages:** `/regions/[region]/` and `/interests/[interest]/` list matching destinations, itineraries and guides. `/destinations/` offers region/interest filter links as plain URLs, with no client-side state.

## 8. Ads

### Configuration

Ad settings come from environment variables, set per environment in Cloudflare Pages. Changing them requires a redeploy but no content or code edits.

- `PUBLIC_ADS_ENABLED` (`true`/`false`)
- `PUBLIC_ADSENSE_CLIENT` (`ca-pub-…`)
- `PUBLIC_AD_SLOT_INCONTENT`, `PUBLIC_AD_SLOT_SIDEBAR`, `PUBLIC_AD_SLOT_FOOTER`

`lib/ads.ts` parses these into a typed config. If ads are disabled or the client ID is missing:

- no AdSense script is emitted
- no reserved ad space is rendered
- `ads.txt` is omitted

When the client ID is present, `ads.txt` contains `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`.

### `<AdSlot placement="incontent|sidebar|footer">`

- Renders a container with a fixed `min-height` per placement and breakpoint:
  - in-content: 280px on mobile, 250px on desktop
  - sidebar: 600px
  - footer: 280px on mobile, 250px on desktop
- Shows a visible "Advertisement" label and a neutral border and background, styled distinctly from content cards and navigation.
- Loads the AdSense script once, `async`, after the consent defaults.
- Each slot calls `adsbygoogle.push({})` only once an IntersectionObserver sees it within 200px of the viewport.
- An unfilled slot keeps its reserved height, so the layout never collapses or shifts.

### Placements

| Placement | Where | Rules |
|---|---|---|
| In-content | Destination, guide and itinerary pages | Max 1. Inserted after the 2nd `h2` of the body. Only on articles of ≥600 words. Never before the first heading. |
| Sidebar | Article pages | Only at ≥1024px. Sticky in the right column. Hidden (not just empty) on smaller screens. |
| Footer/related | Article pages and homepage | Below the related-content cards, above the site footer. Responsive. |

No ads on search, the legal pages, inside navigation, or above the first heading.

## 9. Consent and analytics

- **Consent defaults:**
  - An inline script in `<head>` runs before any Google tag:
    ```js
    gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500})
    ```
  - It also sets `ads_data_redaction: true` and `url_passthrough: false`.
- **Consent UI:** Google Privacy & Messaging, set up in the AdSense dashboard by the site owner (documented). It provides the GDPR/UK/CH message and updates consent state. Until consent is granted, ads are non-personalized and limited.
- **Footer link:** a "Privacy settings" link reopens the consent message via `googlefc.showRevocationMessage()` when it is available.
- **GA4:**
  - Loaded only when `PUBLIC_GA4_ID` is set.
  - Runs under Consent Mode: cookieless pings while consent is denied.
- **Custom events:**

  | Event | Parameters |
  |---|---|
  | `ad_slot_rendered` | `placement` |
  | `ad_slot_viewable` | `placement`; fired when ≥50% of the slot is visible for 1s |
  | `search` | `search_term`, `result_count` |
  | `outbound_click` | `link_domain` |
  | `share` | `method`, `content_type` |

- **Revenue reporting:** AdSense and GA4 are linked in the Google dashboards (documented).

## 10. SEO

- **`<SEO>` in BaseLayout:**
  - title `{seoTitle ?? title} | Discover Turkey` (homepage: just the brand plus tagline)
  - meta description from `seoDescription ?? summary`
  - canonical link from `SITE_URL` + path
  - `og:*` and `twitter:*` tags, using a 1200×630 image derived from the hero
- **JSON-LD:**

  | Page | Schema |
  |---|---|
  | All pages | `BreadcrumbList` |
  | Home | `WebSite` + `SearchAction` (`/search/?q={search_term_string}`), `Organization` |
  | Guides, itineraries | `Article` (`headline`, `author` Person, `datePublished`, `dateModified`, `image`) |
  | Destinations | `TouristDestination` + `Article` |

- **Sitemap:** `@astrojs/sitemap` lists published pages only. Search, the legal pages and drafts are excluded. `lastmod` = `updatedAt`.
- **robots.txt:**
  - production: allow all, plus a `Sitemap:` line
  - preview: `Disallow: /`
- **Build-time validation:** `lib/validate.ts`, run as an Astro integration hook, fails the build on any of:
  - duplicate titles or meta descriptions
  - a summary over 160 chars
  - empty alt text
  - unresolved `related` or `stops` references
  - published entries under 300 words (guides and destinations)
  - missing image credit

  It also warns (does not fail) when a published entry's `reviewedAt` is more than 12 months old.
- **Images:** `<Image>`/`<Picture>` produce AVIF/WebP with `srcset`, explicit width and height, and lazy loading except the hero.

## 11. Accessibility and responsive design (target WCAG 2.2 AA)

- **Layout:** mobile-first CSS with breakpoints at 640, 1024 and 1280px. The article layout is a single column, with a sidebar from 1024px.
- **Structure:** semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`), a skip-to-content link, and one `h1` per page in logical order.
- **Focus:** `:focus-visible` outline ≥2px with ≥3:1 contrast. Focus is never hidden behind the sticky header (`scroll-padding-top`).
- **Targets and contrast:** tap targets ≥24×24px; body text contrast ≥4.5:1; all palette pairs checked.
- **Media:** `prefers-reduced-motion` respected; no autoplaying media.
- **Forms:** search and share controls have accessible names. Search results use an `aria-live` region.

## 12. Performance

- Static HTML from a CDN.
- JavaScript is limited to small islands and inline scripts: the nav toggle, consent bootstrap, ad loader, Pagefind UI on `/search/`, and share buttons.
- The hero image uses `fetchpriority="high"` and no lazy loading.
- Self-hosted, subset fonts (one variable family) with `font-display: swap` and a metric-adjusted fallback.
- Targets on a mid-range mobile device: LCP < 2.5s, CLS < 0.1, INP < 200ms.

## 13. CMS and editorial workflow

- Sveltia CMS at `/admin/`, configured with collections and fields that mirror the zod schemas. Media is stored in `src/assets/images/`.
- Editors authenticate through GitHub OAuth, using a small Cloudflare Worker auth proxy (documented). Editorial workflow mode: each entry is a branch and pull request.
- Lifecycle:
  1. Create the entry (`draft`).
  2. Set it to `in-review`. A Cloudflare preview URL is produced for the PR.
  3. The reviewer checks the `factsToVerify` list and the image licenses.
  4. The reviewer sets `status: published`, `reviewedBy` and `reviewedAt`.
  5. Merge to `main`, which triggers the production deploy.
- Markdown editing directly in GitHub or an IDE remains fully supported.

## 14. Testing and CI

- **Unit (Vitest):** `getPublished`, related scoring, the SEO and JSON-LD builders, `ads.ts` parsing, and the `validate.ts` rules.
- **E2E (Playwright, against `astro preview`):**
  - homepage → destination via keyboard only
  - mobile menu open/close with focus management
  - search for "cappadocia" returns the Cappadocia page first
  - region and interest pages list the expected entries
  - no draft URLs in the build output or sitemap
  - axe-core has no serious or critical violations on each page template
  - CLS is measured with ads enabled (stubbed AdSense) and with ads disabled
- **Lighthouse CI** on home, one destination, one guide and search.
- **GitHub Actions on every PR:** typecheck, build (including content validation), unit tests, E2E and Lighthouse.
- Test fixtures include published sample entries, because the launch content is all drafts.

## 15. Deployment and configuration

- **Build:** Cloudflare Pages connected to the GitHub repo. Build command `npm run build` (`astro build && pagefind --site dist`), output directory `dist`.
- **Environment variables:**
  - `SITE_URL`, `PUBLIC_ENV`, `PUBLIC_GA4_ID`
  - `PUBLIC_ADS_ENABLED`, `PUBLIC_ADSENSE_CLIENT`
  - `PUBLIC_AD_SLOT_INCONTENT`, `PUBLIC_AD_SLOT_SIDEBAR`, `PUBLIC_AD_SLOT_FOOTER`
- **Scheduled rebuild:** a weekly deploy hook, triggered by a Cloudflare cron Worker or a GitHub Actions schedule, keeps seasonal content current.
- **Security headers** via `public/_headers`:
  - HSTS
  - `X-Content-Type-Options`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
  - a CSP allowing the Google ad, consent and analytics domains

## 16. Documentation deliverables

- `README.md`: stack overview, local setup, `npm run dev` / `build` / `preview` / `test`.
- `docs/content-workflow.md`: CMS login, the draft → review → publish lifecycle, field guide, image licensing checklist, volatile-facts policy.
- `docs/deployment.md`: Cloudflare Pages setup, environment variables, custom domain, CMS auth Worker, deploy hooks.
- `docs/ads-and-consent.md`: AdSense site approval, creating ad units and setting slot IDs, Privacy & Messaging setup, GA4 and AdSense linking, verifying Consent Mode.
- `docs/maintenance.md`: re-review cadence, handling stale-review warnings, dependency updates, adding a region, interest or guide category, adding Turkish later.

## 17. Implementation notes (deviations from the above)

- **Runtime:** Astro 7 on Node 24. Astro 7 requires Node ≥ 22.23.4.
- **Related content:** split into three fields, `relatedDestinations`, `relatedGuides` and `relatedItineraries`. This keeps references type-checked per collection and maps cleanly to CMS relation widgets.
- **Images:** stored in `src/content/images/` and referenced as `../images/<file>` from entries.
- **Sitemap:** a custom `/sitemap.xml` endpoint, built from the same publication-gated queries as the pages, replaces `@astrojs/sitemap`.
- **Reference checks:** broken `related` and `stops` references are caught by Astro's own reference validation, so `validate.ts` doesn't repeat them.
- **Preview mode:** `PUBLIC_ENV=preview` enables draft rendering, set as a preview-only environment variable in Cloudflare.
- **In-content ad:** placed at render time in the article column (before the third, or second, h2 once the column has 600+ words), not by a Markdown plugin. Astro 7's default Markdown processor no longer runs rehype plugins, and render-time placement keeps ad settings out of cached content.
- **Consent mode:** `PUBLIC_CONSENT_MODE` selects `strict` (default: denied everywhere, `requestNonPersonalizedAds` set) or `regional` (denied by default only in the EEA, UK and Switzerland). The site owner decides when `regional` is appropriate.
- **Sharing:** native share where available, copy link, and WhatsApp, X and Facebook links, with no third-party scripts.
- **CSP:** the Content-Security-Policy in `public/_headers` sets `frame-ancestors`, `object-src`, `base-uri`, `form-action` and `upgrade-insecure-requests`, but does not restrict `script-src`. AdSense and its consent platform load from a changing set of Google domains, so a domain allowlist would silently break ad delivery. Revisit with a hash-based `strict-dynamic` policy if ads are dropped.
- **CMS sign-in:** the Sveltia CMS Authenticator now uses a GitHub App rather than an OAuth app. A fine-grained personal access token works as a quick start.
- **Fonts:** only the Latin, upright body font is preloaded, and the display font is a single static weight (700). Together these keep simulated mobile LCP at about 2.5 s.
- **Search filters:** Pagefind indexes type, region, interest and category filters. The search UI exposes the type filter; region and interest browsing are served by the browse pages.

## 18. Out of scope (MVP)

- User accounts and server-side "save" (sharing and browser bookmarks cover the save use case)
- Comments
- Booking or affiliate integrations
- Embedded interactive maps
- Turkish translation
- A newsletter

## 19. Site-owner actions required

- Confirm the launch destinations (done: the six listed above).
- Review and publish each drafted entry, and approve each image.
- Review the Privacy and Cookies page text (legal review recommended).
- Provide the domain, AdSense publisher ID and ad slot IDs, and the GA4 measurement ID.
- Configure Privacy & Messaging in AdSense.
- Create a GitHub OAuth app for CMS login.
