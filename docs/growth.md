# Growing traffic

Display ads earn per page view, so the site's income depends on steady visitors. This page covers the setup that helps people find the site. For what to write next, see the [content plan](content-plan.md).

## 1. Search engines (do this first)

1. **Google Search Console.** Go to <https://search.google.com/search-console> and add the site.
   - **Verify ownership.** The **Domain** property, verified with a DNS record in Cloudflare, is easiest and covers every subdomain. Alternatively, choose **URL prefix** → **HTML tag**, and copy only the code from `content="…"` into the `PUBLIC_GOOGLE_SITE_VERIFICATION` environment variable in Cloudflare Pages (Production). Then redeploy.
   - **Submit the sitemap.** Submit `https://<your-site>/sitemap.xml` under **Sitemaps**.
2. **Bing Webmaster Tools.** Go to <https://www.bing.com/webmasters>, choose **Import from Google Search Console**, and submit the same sitemap. Bing also powers several other search engines and AI assistants.
3. **Check monthly.** In Search Console, open **Performance → Search results** and sort by impressions. Searches where you appear in positions 8–30 are where improving or expanding a page pays off fastest.

## 2. Authors: show who writes the site

Search engines and readers trust pages from identifiable people with real experience. Each article's byline links to an author page, which tells search engines who wrote it.

1. **Create your profile.** In the CMS, go to **Authors** and create one for yourself. Add:
   - your real name
   - a bio saying why you know Turkey (where you live, how long you've travelled there, what you specialise in)
   - a photo
   - your specialities
   - links to your profiles elsewhere (Instagram, YouTube, a personal site)
2. **Set yourself as author.** Make yourself the **Author** of the pages you wrote or checked first-hand. Pages can stay with the editorial team where that is more accurate.
3. **Add first-hand detail as you update pages,** and your own photos where you can. This matters more than any technical setting.

Author pages are at `/authors/<id>/`. A team byline (type **Team or organisation**) is described as an organisation rather than a person.

## 3. Pinterest

Pinterest works well for travel content: pins keep sending visitors for months.

1. **Business account.** Create a free Pinterest business account. Under **Settings → Claim**, claim your website using the **HTML tag** option. Put only the code from `content="…"` into the `PUBLIC_PINTEREST_DOMAIN_VERIFY` environment variable, then redeploy.
2. **Generate pin images.** After publishing new pages, run on your computer:

   ```bash
   SITE_URL=https://www.your-site.com npm run pins
   ```

   This writes a tall 1000×1500 image for every published destination, guide and itinerary to `public/pins/`, and `pins.csv` for bulk upload. Each image carries the photo credit, which Creative Commons licences require on adapted images. Commit `public/pins/` and deploy, so the images are online.
3. **Create boards** named "Turkey destinations", "Turkey travel tips" and "Turkey itineraries" (the names used in `pins.csv`).
4. **Upload.** Use **Create → Create pins in bulk** and upload `pins.csv`. Spread new pins out over days rather than posting everything at once.

On the site itself, each article has a **Pinterest** share button, and Pinterest's browser "Save" button picks the tall pin image instead of the wide hero photo.

## 4. Newsletter

See [newsletter](newsletter.md). Subscribers come back each time you send something, without depending on search engines.

## 5. Communities

Answer questions on Reddit (r/travel, r/istanbul, r/Turkey), the Tripadvisor Turkey forums and Facebook trip-planning groups. Link to a page only when it genuinely answers the question; obvious self-promotion is removed and can get accounts banned.

## 6. Other languages

See [translations](translations.md). A German version of your best pages can reach readers in one of Turkey's largest visitor markets, where competition is lower than in English.

## What not to do

- **Don't buy traffic to show AdSense ads.** It risks an invalid-traffic flag and a permanent account ban.
- **Don't publish large numbers of AI-written or thin pages quickly.** Google's spam policies target exactly that.
- **Don't buy links.**
