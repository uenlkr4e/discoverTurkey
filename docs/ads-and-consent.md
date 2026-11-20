# Ads, consent and analytics

## How it works

- **Ad placements.** Ads appear in three places, each with fixed reserved space so nothing jumps while a page loads:
  - one unit inside articles of 600+ words, between sections
  - a sidebar unit beside articles on wide screens
  - a footer unit on articles and the homepage
- **Where ads never appear:** search, legal pages, navigation, and above an article's title.
- **Lazy loading.** Ads load only when a slot scrolls near the screen.
- **Configuration.** All settings are environment variables (see [deployment](deployment.md)). Nothing ad-related lives in content files.
- **Consent defaults.** Google Consent Mode v2 defaults are set before any Google script runs.

## 1. Get approved by AdSense

1. **Have content first.** Publish enough reviewed content before applying; thin sites are usually rejected.
2. **Apply.** Sign up at [AdSense](https://adsense.google.com) and add your site.
3. **Verify the site.** Use the `ads.txt` option:
   - set `PUBLIC_ADS_ENABLED=true` and `PUBLIC_ADSENSE_CLIENT=ca-pub-…` in production
   - deploy, and check `https://<your-site>/ads.txt`
   - with no slot IDs set yet, no ad slots render
4. **Create the ad units.** Once approved, create three **display** ad units under **Ads → By ad unit**:
   - "In-content": responsive
   - "Sidebar": fixed 300×600
   - "Footer": responsive
5. **Add the slot IDs.** Put each unit's ID (the number after `data-ad-slot`) in `PUBLIC_AD_SLOT_INCONTENT`, `PUBLIC_AD_SLOT_SIDEBAR` and `PUBLIC_AD_SLOT_FOOTER`, then redeploy.
6. **Turn Auto ads off.** Keep **Auto ads** off for this site. They would add placements outside the reserved slots and cause layout shifts.

## 2. Turn on the consent message (required for EEA, UK and Switzerland)

Google requires a certified consent management platform to serve ads to visitors in these regions. This site uses Google's own:

1. **Create the message.** In AdSense go to **Privacy & messaging → European regulations**, create a message for your site, and publish it.
2. **Enable Consent Mode.** In the message settings, turn on **Google consent mode** support.
3. **Check it.** Visit the site from an EEA connection or VPN: the consent banner should appear, and the footer shows **Privacy settings**, which reopens it.

Also consider the **US state regulations** message in the same section if you have US visitors.

## 3. Consent mode setting

`PUBLIC_CONSENT_MODE` controls what happens **before** a visitor makes a choice:

| Mode | Behaviour |
| --- | --- |
| `strict` (default) | Ad storage, ad personalization and analytics storage are denied everywhere. Ads are requested as non-personalized. Analytics sends only cookieless pings. |
| `regional` | Denied by default only in the EEA, UK and Switzerland, where the consent banner then asks. Elsewhere they're granted by default, and ads can be personalized. |

Stay on `strict` until you've confirmed, ideally with legal advice, that `regional` suits the countries your visitors come from. Personalized ads usually earn more, but this is your decision as site owner.

## 4. Analytics (GA4)

1. **Create the property.** Create a GA4 property and web data stream for your domain, and set `PUBLIC_GA4_ID` to its `G-…` ID.
2. **Link AdSense.** In GA4 go to **Admin → Product links → AdSense links** and link your AdSense account, to see ad revenue per page.
3. **Register custom dimensions.** Under **Admin → Custom definitions**, register the event parameters you want in reports:
   - `placement`
   - `search_term`
   - `result_count`
   - `link_domain`
   - `method`
   - `content_type`

Events sent by the site:

| Event | Parameters | When |
| --- | --- | --- |
| `ad_slot_rendered` | `placement` | An ad unit was filled |
| `ad_slot_viewable` | `placement` | At least half of a filled unit was on screen for one second |
| `search` | `search_term`, `result_count` | A site search ran |
| `outbound_click` | `link_domain` | A visitor followed a link to another site |
| `share` | `method`, `content_type` | A visitor shared a page |

## Turning ads off

Set `PUBLIC_ADS_ENABLED=false`, or remove it, and redeploy. All ad markup, the AdSense script and `ads.txt` disappear.
