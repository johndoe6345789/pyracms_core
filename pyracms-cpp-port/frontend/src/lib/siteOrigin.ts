import { headers } from 'next/headers'

/**
 * Public origin of this site for absolute URLs (sitemap, robots, Open
 * Graph). NEXT_PUBLIC_SITE_URL wins; otherwise it is read from the
 * request's forwarded host so it is right on any domain. There is
 * deliberately no localhost fallback.
 */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, '')
  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (!host) return ''
    return `${h.get('x-forwarded-proto') ?? 'http'}://${host}`
  } catch {
    return ''
  }
}

/** Backend origin for server-side fetches (inside the container network). */
export function serverApiOrigin(): string {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''
  return url.replace(/\/$/, '')
}

/** Tenant id for a site slug, or null when unknown or unreachable. */
export async function tenantIdOf(slug: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${serverApiOrigin()}/api/tenants/${encodeURIComponent(slug)}`,
      { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const id = (await res.json()).id
    return typeof id === 'number' ? id : null
  } catch {
    return null
  }
}
