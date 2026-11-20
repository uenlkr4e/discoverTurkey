import { parseAdsConfig } from './ads';
import { consentDefaults, parseConsentMode, parseGaId } from './consent';
import { parseNewsletterConfig } from './newsletter';
import { parseVerification } from './verification';

// Parsed once per build from PUBLIC_* environment variables (set per environment in Cloudflare Pages).
const env = import.meta.env as Record<string, string | undefined>;

export const ads = parseAdsConfig(env);
export const consentMode = parseConsentMode(env);
export const consentDefaultArgs = consentDefaults(consentMode);
export const gaId = parseGaId(env);
export const newsletter = parseNewsletterConfig(env);
export const verification = parseVerification(env);
