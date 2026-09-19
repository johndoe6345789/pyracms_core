/** URL allow-listing for user-supplied links, images and redirects. */

const LINK_SCHEMES = ['http:', 'https:', 'mailto:']
const IMG_SCHEMES = ['http:', 'https:', 'blob:']
const BASE = 'http://safe.invalid'
// Browsers ignore whitespace/controls inside a scheme ("java\tscript:")
const isJunk = (ch: string) => {
  const c = ch.charCodeAt(0)
  return c <= 0x20 || (c >= 0x7f && c <= 0x9f)
}
const stripJunk = (s: string) =>
  Array.from(s)
    .filter((c) => !isJunk(c))
    .join('')

function allowed(url: unknown, schemes: string[]): string | undefined {
  if (typeof url !== 'string') return undefined
  const stripped = stripJunk(url)
  if (!stripped) return undefined
  if (stripped.startsWith('\\') || stripped.startsWith('//')) return undefined
  try {
    const u = new URL(stripped, BASE)
    if (u.origin === BASE) {
      // relative: only when it does not name a scheme of its own
      return /^[a-z][a-z0-9+.-]*:/i.test(stripped) ? undefined : url.trim()
    }
    return schemes.includes(u.protocol) ? url.trim() : undefined
  } catch {
    return undefined
  }
}

/** Returns `url` when relative or http(s)/mailto, else undefined. */
export function safeHref(url: unknown): string | undefined {
  return allowed(url, LINK_SCHEMES)
}

/** Like safeHref for media; also allows raster `data:image/*` (not SVG). */
export function safeSrc(url: unknown): string | undefined {
  const ok = allowed(url, IMG_SCHEMES)
  if (ok) return ok
  if (typeof url !== 'string') return undefined
  const t = url.trim()
  return /^data:image\/(png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=]+$/i.test(t)
    ? t
    : undefined
}
