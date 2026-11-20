export const SITE = {
  name: 'Discover Turkey',
  tagline: 'Discover where to go and what to do in Turkey',
  description:
    'Destination guides, itineraries and practical travel advice for planning a trip to Turkey, reviewed by our editors.',
} as const;

export const NAV = [
  { label: 'Destinations', href: '/destinations/' },
  { label: 'Experiences', href: '/interests/' },
  { label: 'Itineraries', href: '/itineraries/' },
  { label: 'Travel tips', href: '/guides/' },
] as const;

export const FOOTER_LINKS = [
  { label: 'About', href: '/about/' },
  { label: 'Editorial policy', href: '/editorial-policy/' },
  { label: 'Privacy', href: '/privacy/' },
  { label: 'Cookies', href: '/cookies/' },
] as const;
