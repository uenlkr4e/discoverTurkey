import { defineConfig, fontProviders } from 'astro/config';
import { DEFAULT_LOCALE, LOCALE_CODES } from './src/i18n/locales.ts';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  // Sets Astro.currentLocale from the URL. Translated pages are built from src/pages/[locale]/,
  // and only for locales that have published content.
  i18n: {
    locales: LOCALE_CODES,
    defaultLocale: DEFAULT_LOCALE,
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
  // Fixture builds (CONTENT_DIR set) get their own cache so test content can never leak into real builds.
  ...(process.env.CONTENT_DIR ? { cacheDir: './node_modules/.astro-fixtures' } : {}),
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-body',
      weights: ['400 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Gloock',
      cssVariable: '--font-display',
      weights: ['400'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
});
