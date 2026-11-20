type Env = Record<string, string | undefined>;

export interface NewsletterConfig {
  /** Where the signup form posts: the provider's embed/subscribe URL. */
  action: string;
  /** Origin added to the form-action Content-Security-Policy. */
  origin: string;
  /** Name of the email input the provider expects, e.g. "email" or "EMAIL". */
  emailField: string;
  /** Provider name shown under the form, e.g. "Buttondown". */
  provider: string;
}

/** Returns null when no signup URL is set. Throws on bad values so a broken form never ships. */
export function parseNewsletterConfig(env: Env): NewsletterConfig | null {
  const action = env.PUBLIC_NEWSLETTER_ACTION?.trim();
  if (!action) return null;

  let url: URL;
  try {
    url = new URL(action);
  } catch {
    throw new Error(`PUBLIC_NEWSLETTER_ACTION must be a full URL, got "${action}"`);
  }
  if (url.protocol !== 'https:') throw new Error(`PUBLIC_NEWSLETTER_ACTION must use https, got "${action}"`);

  const emailField = env.PUBLIC_NEWSLETTER_EMAIL_FIELD?.trim() || 'email';
  if (!/^[\w[\]-]+$/.test(emailField)) {
    throw new Error(`PUBLIC_NEWSLETTER_EMAIL_FIELD must be a form field name, got "${emailField}"`);
  }

  const provider = env.PUBLIC_NEWSLETTER_PROVIDER?.trim();
  if (!provider) throw new Error('PUBLIC_NEWSLETTER_PROVIDER (e.g. "Buttondown") is required when the newsletter is enabled');

  return { action: url.href, origin: url.origin, emailField, provider };
}
