import { parseConsentMode } from './consent';
import { wordCount } from './content';

type Env = Record<string, string | undefined>;

export const PLACEMENTS = ['incontent', 'sidebar', 'footer'] as const;
export type Placement = (typeof PLACEMENTS)[number];

export interface AdsConfig {
  client: string;
  slots: Partial<Record<Placement, string>>;
  /** Force non-personalized ads (strict consent mode). */
  nonPersonalized: boolean;
}

export const IN_CONTENT_MIN_WORDS = 600;

const SLOT_ENV: Record<Placement, string> = {
  incontent: 'PUBLIC_AD_SLOT_INCONTENT',
  sidebar: 'PUBLIC_AD_SLOT_SIDEBAR',
  footer: 'PUBLIC_AD_SLOT_FOOTER',
};

/** Returns null when ads are off. Throws on malformed IDs so a bad deploy fails the build. */
export function parseAdsConfig(env: Env): AdsConfig | null {
  if (env.PUBLIC_ADS_ENABLED?.trim() !== 'true') return null;

  const client = env.PUBLIC_ADSENSE_CLIENT?.trim() ?? '';
  if (!/^ca-pub-\d{10,20}$/.test(client)) {
    throw new Error(`PUBLIC_ADSENSE_CLIENT must look like ca-pub-0000000000000000 when ads are enabled, got "${client}"`);
  }

  const slots: Partial<Record<Placement, string>> = {};
  for (const placement of PLACEMENTS) {
    const name = SLOT_ENV[placement];
    const slot = env[name]?.trim();
    if (!slot) continue;
    if (!/^\d{6,20}$/.test(slot)) throw new Error(`${name} must be a numeric AdSense slot id, got "${slot}"`);
    slots[placement] = slot;
  }

  return { client, slots, nonPersonalized: parseConsentMode(env) === 'strict' };
}

/**
 * Markup for one ad placement. The <ins> only becomes an AdSense unit (class "adsbygoogle")
 * when the client loader sees it near the viewport; its size is fixed in CSS so nothing shifts.
 */
export function adSlotHtml(placement: Placement, config: AdsConfig | null, label = 'Advertisement'): string {
  const slot = config?.slots[placement];
  if (!config || !slot) return '';
  return (
    `<div class="ad-slot ad-slot--${placement}" data-ad-placement="${placement}" data-pagefind-ignore="all">` +
    `<p class="ad-label">${label}</p>` +
    `<ins class="ad-unit" data-ad-client="${config.client}" data-ad-slot="${slot}"></ins></div>`
  );
}

/**
 * Places the in-content ad in rendered article HTML: before the third h2, or the second if
 * there are only two, and never before the first heading. Short articles get no in-content ad.
 */
export function insertInContentAd(html: string, adHtml: string, minWords = IN_CONTENT_MIN_WORDS): string {
  if (!adHtml) return html;
  if (wordCount(html.replace(/<[^>]*>/g, ' ')) < minWords) return html;
  const headings = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index);
  const at = headings[2] ?? headings[1];
  return at === undefined ? html : html.slice(0, at) + adHtml + html.slice(at);
}

export function adsTxt(config: AdsConfig): string {
  return `google.com, ${config.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`;
}
