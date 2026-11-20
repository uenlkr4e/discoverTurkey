interface ImportMetaEnv {
  readonly PUBLIC_ENV?: string;
  readonly PUBLIC_ADS_ENABLED?: string;
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_AD_SLOT_INCONTENT?: string;
  readonly PUBLIC_AD_SLOT_SIDEBAR?: string;
  readonly PUBLIC_AD_SLOT_FOOTER?: string;
  readonly PUBLIC_CONSENT_MODE?: string;
  readonly PUBLIC_GA4_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  adsbygoogle?: { push: (params: object) => void; requestNonPersonalizedAds?: number };
  googlefc?: {
    callbackQueue?: (Record<string, () => void> | (() => void))[];
    showRevocationMessage?: () => void;
  };
}
