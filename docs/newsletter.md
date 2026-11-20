# Newsletter

A signup form appears at the end of every published article and near the bottom of the homepage once a newsletter provider is configured. Without one, nothing is shown.

The form posts straight to your provider, so the site needs no server code and stores no email addresses. The provider shows its own confirmation page, in a new tab.

## Set it up

1. **Choose a provider.** Any provider with an embeddable HTML signup form works, for example Buttondown, Kit (formerly ConvertKit), Mailchimp, Brevo or MailerLite. Compare their free tiers and features when you sign up. Turn on **double opt-in** (subscribers confirm by email): it keeps the list clean and is the safest choice under EU and UK rules.
2. **Find the form details.** In the provider's dashboard, open the **embedded form** or **HTML form** code, and copy:
   - the URL in the form's `action="…"` attribute
   - the `name="…"` of the email input
3. **Set the environment variables** in Cloudflare Pages (Production), then redeploy:

| Variable | Value |
| --- | --- |
| `PUBLIC_NEWSLETTER_ACTION` | The form's `action` URL. Must start with `https://`. |
| `PUBLIC_NEWSLETTER_PROVIDER` | The provider's name, shown under the form ("Emails are sent by …"). |
| `PUBLIC_NEWSLETTER_EMAIL_FIELD` | The email input's `name`. Leave empty if it is `email`. |

Typical values (always check against your own form code, as providers change them):

| Provider | Action URL looks like | Email field |
| --- | --- | --- |
| Buttondown | `https://buttondown.com/api/emails/embed-subscribe/<your-username>` | `email` |
| Kit | `https://app.kit.com/forms/<form-id>/subscriptions` | `email_address` |
| Mailchimp | `https://<something>.list-manage.com/subscribe/post?u=…&id=…` | `EMAIL` |
| Brevo | `https://<something>.sibforms.com/serve/…` | `EMAIL` |

4. **Test it.** Subscribe with your own address on the live site. Check that the provider's confirmation page opens and the confirmation email arrives.

The build fails with a clear message if the action URL isn't a full `https://` URL, or if the provider name is missing.

## Security headers

The site's Content-Security-Policy only lets forms submit to the site itself. When the newsletter is configured, the build adds the provider's origin (for example `https://buttondown.com`) to `form-action` in the generated `/_headers` file. You don't need to edit headers yourself.

## Measuring it

Each submission sends a `newsletter_signup` event to Google Analytics, with a `placement` parameter (`article` or `home`). Register `placement` as a custom dimension (see [ads and consent](ads-and-consent.md)) to compare the two.

## What to send

Aim for one useful email a month: new guides, a seasonal tip ("book Şeb-i Arus tickets now"), and any change that affects travellers, such as new entry rules. Each email should link back to pages on the site. That brings subscribers back, and their visits count towards your ad revenue.

## Privacy

The [privacy policy](../src/content/pages/privacy.md) describes the newsletter in general terms. When you choose a provider, check its data processing terms, and name it in the policy if your adviser recommends it.
