type Env = Record<string, string | undefined>;

export interface VerificationTags {
  /** Google Search Console HTML-tag verification code. */
  google?: string;
  /** Pinterest "claim your website" code. */
  pinterest?: string;
}

const CODE = /^[\w-]{6,100}$/;

function code(env: Env, name: string): string | undefined {
  const value = env[name]?.trim();
  if (!value) return undefined;
  if (!CODE.test(value)) throw new Error(`${name} must be the verification code only (not the whole meta tag), got "${value}"`);
  return value;
}

/** Site-ownership meta tags for Search Console and Pinterest, from PUBLIC_* environment variables. */
export function parseVerification(env: Env): VerificationTags {
  return {
    google: code(env, 'PUBLIC_GOOGLE_SITE_VERIFICATION'),
    pinterest: code(env, 'PUBLIC_PINTEREST_DOMAIN_VERIFY'),
  };
}
