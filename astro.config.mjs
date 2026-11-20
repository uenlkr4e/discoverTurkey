import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
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
