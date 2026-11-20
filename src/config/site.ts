import type { UiKey } from '../i18n/ui';

// Tagline and description are translated: see 'site.tagline' and 'site.description' in src/i18n/ui.ts.
export const SITE = {
  name: 'Discover Turkey',
} as const;

// Paths are for the default locale; components localise them.
export const NAV: { key: UiKey; href: string }[] = [
  { key: 'nav.destinations', href: '/destinations/' },
  { key: 'nav.interests', href: '/interests/' },
  { key: 'nav.itineraries', href: '/itineraries/' },
  { key: 'nav.guides', href: '/guides/' },
];

export const FOOTER_LINKS: { key: UiKey; href: string }[] = [
  { key: 'footer.about', href: '/about/' },
  { key: 'footer.editorialPolicy', href: '/editorial-policy/' },
  { key: 'footer.privacy', href: '/privacy/' },
  { key: 'footer.cookies', href: '/cookies/' },
];
