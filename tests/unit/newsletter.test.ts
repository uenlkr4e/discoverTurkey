import { describe, expect, it } from 'vitest';
import { headersFile } from '../../src/lib/headers';
import { parseNewsletterConfig } from '../../src/lib/newsletter';

const env = {
  PUBLIC_NEWSLETTER_ACTION: 'https://buttondown.com/api/emails/embed-subscribe/discoverturkey',
  PUBLIC_NEWSLETTER_PROVIDER: 'Buttondown',
};

describe('parseNewsletterConfig', () => {
  it('is off without a signup URL', () => {
    expect(parseNewsletterConfig({})).toBeNull();
    expect(parseNewsletterConfig({ PUBLIC_NEWSLETTER_ACTION: ' ' })).toBeNull();
  });

  it('parses the action, its origin and the default email field', () => {
    expect(parseNewsletterConfig(env)).toEqual({
      action: 'https://buttondown.com/api/emails/embed-subscribe/discoverturkey',
      origin: 'https://buttondown.com',
      emailField: 'email',
      provider: 'Buttondown',
    });
    expect(parseNewsletterConfig({ ...env, PUBLIC_NEWSLETTER_EMAIL_FIELD: 'EMAIL' })?.emailField).toBe('EMAIL');
  });

  it('fails loudly on unusable settings', () => {
    expect(() => parseNewsletterConfig({ ...env, PUBLIC_NEWSLETTER_ACTION: 'not a url' })).toThrow(/full URL/);
    expect(() => parseNewsletterConfig({ ...env, PUBLIC_NEWSLETTER_ACTION: 'http://example.com/x' })).toThrow(/https/);
    expect(() => parseNewsletterConfig({ ...env, PUBLIC_NEWSLETTER_EMAIL_FIELD: 'e mail"' })).toThrow(/field name/);
    expect(() => parseNewsletterConfig({ ...env, PUBLIC_NEWSLETTER_PROVIDER: '' })).toThrow(/PUBLIC_NEWSLETTER_PROVIDER/);
  });
});

describe('headersFile', () => {
  it('only lets forms post to the site by default', () => {
    expect(headersFile()).toContain("form-action 'self';");
  });

  it('allows forms to post to the newsletter provider', () => {
    expect(headersFile({ formOrigins: ['https://buttondown.com'] })).toContain(
      "form-action 'self' https://buttondown.com;",
    );
  });
});
