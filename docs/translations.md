# Translations

The site can be published in more than one language. English is the default and lives at the root (`/destinations/istanbul/`). Translations live under a language prefix (`/de/destinations/istanbul/`). German is set up; other languages can be added the same way.

Nothing appears in a language until it has published content. With no German entries there is no `/de/` section at all. Once one German entry is published:

- **Pages.** The German homepage, search and the matching listing and taxonomy pages are built. Listings only show German entries; there is no mixing of languages in a list.
- **Links between versions.** Each page links its language versions with `hreflang` tags, so search engines show the right version to each reader. The header offers the other language ("Deutsch" / "English") when the current page has a translation.
- **Navigation.** German pages link to German sections where they exist, and to the English ones otherwise.
- **Interface text.** Labels, dates and the ad label ("Anzeige") are in German.
- **Search.** German search only finds German pages.

## Translating an entry

### In the CMS

Open an entry and switch the language selector to **Deutsch**.

- **Text fields.** Translate the title, summary, body and other text.
- **Copied fields.** Region, interests, coordinates, image, related content, author and the other structural fields are copied from the English entry, so you don't re-enter them.
- **Publishing.** Set the German entry's own **Publication status**, **Reviewed by** and **Review date**. A translation is reviewed and published separately from the English original. The same rule applies: no review, no page.

The CMS saves the translation as `src/content/<collection>/de/<same-file-name>.md`, for example `src/content/destinations/de/istanbul.md`. The URL keeps the English slug (`/de/destinations/istanbul/`).

### By hand

Copy the English file into the `de` folder with the same file name, translate the text fields, and set the status and review fields. Two things to adjust:

- **Hero image path.** It needs one more `../`, for example `src: ../../images/istanbul.jpg`.
- **References.** Keep them pointing at the English ids (`relatedDestinations: [cappadocia]`). The site links them to the German versions automatically, and hides them until those are published.

## Translating regions, interests and categories

In the CMS, under **Regions, interests and categories**, each item has an optional **Translations → German** name and description. In `src/data/*.yaml`:

```yaml
- id: aegean
  name: Aegean
  description: Turkey's western coast and its hinterland, with İzmir, ancient Ephesus and olive-covered hills.
  translations:
    de:
      name: Ägäis
      description: Die Westküste der Türkei und ihr Hinterland, mit İzmir, dem antiken Ephesos und Olivenhainen.
```

Without a translation, German pages show the English name.

## Interface text

All labels, headings and messages are in `src/i18n/ui.ts`, with one block per language. The TypeScript type requires every language to define every key, so a missing translation fails the build.

## Before launching a German section

- **Translate quality, not quantity.** Start with your 10–20 best pages, translated or reviewed by a fluent speaker. Raw machine translation reads badly and can be treated as low-quality content.
- **Legal pages.** Sites aimed at readers in Germany generally need an **Impressum** (legal notice), and German readers expect a German privacy policy. Translate `privacy`, `cookies` and `about` into `src/content/pages/de/`, and add an Impressum page, with advice from a qualified adviser. Footer links switch to the German versions automatically once they exist.
- **Consent and ads.** The AdSense consent message is shown in the reader's language by Google. Ads on German pages are labelled "Anzeige".
- **Pinterest images.** `npm run pins` currently makes pins for English pages only.

## Adding another language

1. **Register the language.** Add it to `LOCALES` in `src/i18n/locales.ts`, with its name, HTML language code, Open Graph locale and date format.
2. **Add interface text.** Add a block for it in `src/i18n/ui.ts`. The build lists any missing keys.
3. **Configure the CMS.** Add it to `i18n.locales` in `public/admin/config.yml`, and add a `translations` sub-field for it to the taxonomy fields.
4. **Add content.** Put translated entries in a subfolder named after the language code.

Routes don't need to change: `src/pages/[locale]/` builds every language from the same templates.
