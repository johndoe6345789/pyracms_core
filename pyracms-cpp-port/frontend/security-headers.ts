/** HTTP security headers applied to every response (see next.config.ts). */

type Header = { key: string; value: string }

function origin(url: string | undefined): string {
  try { return url ? new URL(url).origin : '' } catch { return '' }
}

export function buildCsp(apiUrl?: string, dev = false): string {
  const api = origin(apiUrl)
  const ws = api.replace(/^http/, 'ws')
  const cdn = 'https://cdn.jsdelivr.net' // Monaco editor loader
  // Cloudflare injects its web-analytics beacon on proxied sites
  const cfScript = 'https://static.cloudflareinsights.com'
  const cfConnect = 'https://cloudflareinsights.com'
  const scriptSrc = `'self' 'unsafe-inline' ${cdn} ${cfScript}`
  const connectSrc = `'self' ${api} ${ws} ${cdn} ${cfConnect}`
  const d = [
    ["default-src", "'self'"],
    // Next.js emits inline bootstrap scripts; nonces would need middleware
    ['script-src', `${scriptSrc}${dev ? " 'unsafe-eval'" : ''}`],
    ['style-src', `'self' 'unsafe-inline' ${cdn} https://fonts.googleapis.com`],
    ['font-src', `'self' data: ${cdn} https://fonts.gstatic.com`],
    ['img-src', "'self' data: blob: https:"],
    ['media-src', "'self' blob: https:"],
    ['connect-src', `${connectSrc}${dev ? ' ws:' : ''}`.trim()],
    ['worker-src', "'self' blob:"],
    ['frame-src', "'none'"],
    ['object-src', "'none'"],
    ['base-uri', "'self'"],
    ['form-action', "'self'"],
    ['frame-ancestors', "'none'"],
  ]
  return d.map(([k, v]) => `${k} ${v}`).join('; ')
}

export function securityHeaders(
  apiUrl?: string,
  dev = process.env.NODE_ENV !== 'production',
): Header[] {
  return [
    { key: 'Content-Security-Policy', value: buildCsp(apiUrl, dev) },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), '
        + 'usb=(), clipboard-read=(self), clipboard-write=(self)',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ]
}
