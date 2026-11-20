// Cloudflare Pages response headers: https://developers.cloudflare.com/pages/configuration/headers/
// Generated at build time so the form-action policy can allow the newsletter provider.

export function headersFile(opts: { formOrigins?: string[] } = {}): string {
  const formAction = ["'self'", ...(opts.formOrigins ?? [])].join(' ');
  const csp = [
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action ${formAction}`,
    'upgrade-insecure-requests',
  ].join('; ');
  return `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=()
  Content-Security-Policy: ${csp}

/admin/*
  X-Robots-Tag: noindex, nofollow
  Cache-Control: no-cache

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;
}
