import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Source Sans 3',
      cssVariable: '--font-body',
      weights: ['400 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Fraunces',
      cssVariable: '--font-display',
      weights: ['700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
});
