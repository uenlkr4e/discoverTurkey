# Content workflow

How editors add, review and publish destinations, guides, itineraries and pages.

## The rule that protects readers

Nothing appears on the live site unless it is:

1. set to **Published**, and
2. has a **Reviewed by** name and a **Review date**.

The build fails if a published entry is missing either. Drafts and entries "In review" never get a public page, a link, a sitemap entry or a search result.

## Editing in the CMS

Open `https://<your-site>/admin/` and sign in with GitHub. Your GitHub account must have write access to the repository.

The CMS uses an editorial workflow. Each entry you create or change lives on its own branch and pull request until it is published:

| CMS column | What it means |
| --- | --- |
| Drafts | Being written. Saved to a branch; not on the live site. |
| In review | Ready for a reviewer. Cloudflare builds a preview of the branch (see below). |
| Ready | Approved. **Publish** merges it into `main`, which deploys the live site. |

The CMS column and the entry's **Publication status** field are separate. Set the status field to **Published**, and fill in the reviewer and review date, before you publish from the CMS. Otherwise the change merges but the page stays hidden.

### Previewing a draft

Every branch gets a Cloudflare Pages preview deployment, built with drafts visible. A yellow banner marks drafts, and the whole preview is hidden from search engines. Find the preview URL on the pull request in GitHub, or in Cloudflare Pages under **Deployments**.

Guides show their **Facts to verify** checklist in the draft banner on previews.

### Working without GitHub sign-in

In Chrome or Edge, choose **Work with Local Repository** on the CMS sign-in screen and select your local clone of the repository. Changes are written to your files; commit and push them yourself.

## Fields

| Field | Guidance |
| --- | --- |
| Title | Unique across the site. Becomes the URL slug when the entry is first saved; Turkish letters are converted (İzmir → `izmir`). |
| Summary | 50–160 characters. Shown on cards and used as the meta description. Must be unique. |
| Hero image | Landscape, at least 1600px wide. Alt text and credit are required (see below). |
| Body | Markdown. Use `##` headings for sections; long articles get one ad placed automatically between sections. |
| Tags | Lower-case keywords. Shared tags help suggest related pages. |
| Related … | Pages you want listed first under "Keep planning". The rest are suggested automatically by region, interests and tags. |
| SEO title / description | Optional overrides for search results. |
| Reviewed by / Review date | The editor who checked every fact, and when. |
| Last updated | Bump this whenever the content changes meaningfully. |

Destinations also have region, interests, best time to visit (with a note per season), suggested stay, coordinates (used for map links), attractions, getting there, getting around, and food and local experiences. **Featured** puts a destination on the homepage, and a **Seasonal highlight** shows it there during that season.

Itineraries have a number of days, interests and day-by-day stops. A stop links to its destination only once that destination is published.

Published destinations and guides need at least 300 words. Pages reviewed more than 12 months ago are listed as warnings in the build log.

## Accuracy policy

- **Volatile facts.** Never state prices, opening hours, fares, visa fees or entry rules as fixed facts. Describe the general picture and link to the official source, for example the e-Visa portal or the official museum and transport sites.
- **Facts to verify.** On guides, list every time-sensitive claim under **Facts to verify**. The reviewer checks each one against an official source before publishing.
- **Re-review.** Re-review each page at least once a year, and after any major change such as new entry rules or a transport strike.

## Images

1. **Licence.** Use only images whose licence allows commercial use on an ad-supported site:
   - your own photos
   - Unsplash (Unsplash License)
   - Wikimedia Commons files under CC0, CC BY or CC BY-SA. Check the file page; some are non-commercial or have personality rights warnings.
2. **Credit.** Record the author, source URL and licence in the image credit fields. The credit is shown under the image.
3. **Alt text.** Write alt text that describes what the photo shows, for example "Hot-air balloons over the valleys of Göreme at sunrise", not "Cappadocia".
4. **Size.** Upload the original at 1600px wide or more. The site generates the smaller sizes.

Images are stored in `src/content/images/`.

## Regions, interests and guide categories

Edit these under **Regions, interests and categories** in the CMS, or in `src/data/*.yaml`.

- **IDs appear in URLs.** Don't change the ID of one that has published content.
- **Pages appear with content.** A region or interest page only appears once it has published content.

## Editing without the CMS

Entries are Markdown files with YAML frontmatter in `src/content/<collection>/`. Run `npm run dev` to preview locally, and `npm run build` to run the same validation as production.
