import { describe, expect, it } from 'vitest';
import { CONSENT_REGIONS, consentDefaults, parseConsentMode, parseGaId } from '../../src/lib/consent';

const denied = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};

describe('parseConsentMode', () => {
  it('defaults to strict', () => {
    expect(parseConsentMode({})).toBe('strict');
    expect(parseConsentMode({ PUBLIC_CONSENT_MODE: 'regional' })).toBe('regional');
  });

  it('rejects unknown modes', () => {
    expect(() => parseConsentMode({ PUBLIC_CONSENT_MODE: 'lax' })).toThrow(/PUBLIC_CONSENT_MODE/);
  });
});

describe('consentDefaults', () => {
  it('denies everything everywhere in strict mode', () => {
    expect(consentDefaults('strict')).toEqual([{ ...denied, wait_for_update: 500 }]);
  });

  it('denies only in the EEA, UK and Switzerland in regional mode', () => {
    const [global, regional] = consentDefaults('regional');
    expect(global).toEqual({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
    expect(regional).toEqual({ ...denied, region: CONSENT_REGIONS, wait_for_update: 500 });
    expect(CONSENT_REGIONS).toHaveLength(32);
    expect(CONSENT_REGIONS).toEqual(expect.arrayContaining(['DE', 'FR', 'GB', 'CH', 'NO', 'IS', 'LI']));
  });
});

describe('parseGaId', () => {
  it('accepts GA4 measurement ids and ignores empty values', () => {
    expect(parseGaId({ PUBLIC_GA4_ID: 'G-ABC123XYZ' })).toBe('G-ABC123XYZ');
    expect(parseGaId({})).toBeUndefined();
    expect(parseGaId({ PUBLIC_GA4_ID: '' })).toBeUndefined();
  });

  it('rejects other id formats', () => {
    expect(() => parseGaId({ PUBLIC_GA4_ID: 'UA-1234-1' })).toThrow(/PUBLIC_GA4_ID/);
  });
});
