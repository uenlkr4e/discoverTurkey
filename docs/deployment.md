# Deployment

The site is static HTML built by Astro and served by Cloudflare Pages. Pushing to `main` deploys production; every other branch gets a preview deployment.

## 1. Cloudflare Pages project

1. **Create the project.** In the Cloudflare dashboard go to **Workers & Pages → Create → Pages → Connect to Git**, and choose `uenlkr4e/discoverTurkey`.
2. **Build settings:**
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main`
3. **Environment variables.** Under **Settings → Variables and Secrets**, set the variables per environment:

| Variable | Production | Preview |
| --- | --- | --- |
| `NODE_VERSION` | `24` | `24` |
| `SITE_URL` | `https://www.your-domain.com` | `https://www.your-domain.com` |
| `PUBLIC_ENV` | *(unset)* | `preview` |
| `PUBLIC_ADS_ENABLED` | `true` once AdSense approves the site | `false` |
| `PUBLIC_ADSENSE_CLIENT` | `ca-pub-…` | *(unset)* |
| `PUBLIC_AD_SLOT_INCONTENT` / `_SIDEBAR` / `_FOOTER` | ad unit IDs | *(unset)* |
| `PUBLIC_CONSENT_MODE` | `strict` | `strict` |
| `PUBLIC_GA4_ID` | `G-…` | *(unset)* |
| `PUBLIC_NEWSLETTER_ACTION` / `_PROVIDER` / `_EMAIL_FIELD` | see [newsletter](newsletter.md) | *(unset)* |

   `PUBLIC_ENV=preview` is what makes drafts visible on previews and blocks crawlers. Never set it in production. Keep `SITE_URL` as the production domain in both environments, so canonical URLs never point at preview hosts.

   Changing a variable takes effect on the next deployment. Use **Deployments → Retry deployment** to apply it immediately.

4. **Custom domain.** Under **Custom domains**, add your domain. Cloudflare provisions HTTPS automatically. Then turn on:
   - **SSL/TLS → Always Use HTTPS**
   - **Rules → Redirect Rules**: redirect the bare domain to `www`, or the other way round, to match `SITE_URL`.

Security and caching headers are generated at build time by `src/lib/headers.ts` (served as `/_headers`).

## 2. CMS sign-in (Sveltia CMS Authenticator)

Editors sign in to `/admin/` with GitHub. Two options:

- **Quick start (developers):** on the sign-in screen choose **Sign In Using Access Token** and paste a GitHub fine-grained token with *Contents* and *Pull requests* read/write access to this repository.
- **For editors (recommended):** deploy the authenticator once:
  1. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to Cloudflare Workers using its **Deploy to Cloudflare** button. Note the Worker URL, e.g. `https://sveltia-cms-auth.<subdomain>.workers.dev`.
  2. Register a GitHub App from the link in that README. Set the redirect URI to `<worker URL>/callback`, then install the app on this repository only.
  3. In the Worker's **Settings → Variables and Secrets**, set:
     - `GITHUB_CLIENT_ID`
     - `GITHUB_CLIENT_SECRET` (as a secret)
     - `ALLOWED_DOMAINS`: your site's hostname, e.g. `www.your-domain.com`
  4. In `public/admin/config.yml`, set `backend.base_url` to the Worker URL and `site_url` to the production URL. Commit and push.

Anyone who signs in needs write access to the GitHub repository.

## 3. Weekly rebuild

The homepage's seasonal picks are computed at build time. A GitHub Actions workflow (`.github/workflows/scheduled-rebuild.yml`) rebuilds production every Monday:

1. **Create the hook.** In Cloudflare Pages go to **Settings → Builds → Deploy hooks**, and create a hook for the `main` branch.
2. **Store it in GitHub.** In GitHub go to **Settings → Secrets and variables → Actions**, and add the hook URL as the secret `CLOUDFLARE_DEPLOY_HOOK_URL`.

You can also run the workflow by hand from the **Actions** tab.

## 4. Continuous integration

`.github/workflows/ci.yml` runs on every pull request and push to `main`:

- type-check
- unit tests
- a production build of the real content, which validates every entry
- Playwright end-to-end and accessibility tests against generated fixture content
- Lighthouse checks: accessibility ≥ 0.95, SEO ≥ 0.9 and CLS ≤ 0.1 fail the run; performance and LCP only warn

Protect `main` in GitHub (**Settings → Branches**) and require the **CI / test** check, so CMS pull requests can't be merged with invalid content.

## Local commands

See the [README](../README.md). To reproduce a preview build locally:

```sh
PUBLIC_ENV=preview npm run build && npm run preview
```
