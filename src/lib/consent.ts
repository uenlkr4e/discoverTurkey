type Env = Record<string, string | undefined>;

export type ConsentMode = 'strict' | 'regional';

/** EEA (EU 27 + Iceland, Liechtenstein, Norway), United Kingdom and Switzerland. */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
  'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
];

const DENIED = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const;

/**
 * strict (default): nothing is granted anywhere until the consent platform records consent.
 * regional: denied by default only where Google requires a certified CMP; enable only once the
 * site owner has confirmed this is appropriate for the audiences served.
 */
export function parseConsentMode(env: Env): ConsentMode {
  const mode = env.PUBLIC_CONSENT_MODE?.trim() || 'strict';
  if (mode !== 'strict' && mode !== 'regional') {
    throw new Error(`PUBLIC_CONSENT_MODE must be "strict" or "regional", got "${mode}"`);
  }
  return mode;
}

/** Arguments for successive gtag('consent', 'default', …) calls. */
export function consentDefaults(mode: ConsentMode): Record<string, unknown>[] {
  if (mode === 'strict') return [{ ...DENIED, wait_for_update: 500 }];
  return [{ ...GRANTED }, { ...DENIED, region: CONSENT_REGIONS, wait_for_update: 500 }];
}

export function parseGaId(env: Env): string | undefined {
  const id = env.PUBLIC_GA4_ID?.trim();
  if (!id) return undefined;
  if (!/^G-[A-Z0-9]{4,20}$/.test(id)) throw new Error(`PUBLIC_GA4_ID must look like G-XXXXXXXXXX, got "${id}"`);
  return id;
}
