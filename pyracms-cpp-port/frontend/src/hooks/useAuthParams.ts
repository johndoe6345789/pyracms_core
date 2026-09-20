'use client'

import { useSearchParams } from 'next/navigation'

/** Only same-origin relative paths are honoured (no open redirect). */
export function safeRedirect(value: string | null): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) {
    return undefined
  }
  // "/\host" and control chars are read as "//host" by browsers
  if (value.includes('\\')) return undefined
  for (const ch of value) {
    if (ch.charCodeAt(0) < 32 || ch.charCodeAt(0) === 127) return undefined
  }
  return value
}

const SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]{0,62}$/

/**
 * Reads `?tenant=<slug>` and `?redirect=<path>` from the URL. `tenant`
 * selects which site's accounts the auth pages talk to; without it the
 * platform (portal) account scope is used.
 */
export function useAuthParams(fallbackRedirect?: string) {
  const params = useSearchParams()
  const rawTenant = params.get('tenant') || ''
  const tenant = SLUG.test(rawTenant) ? rawTenant : undefined
  const explicitRedirect = safeRedirect(params.get('redirect'))
  const redirectTo =
    explicitRedirect ??
    fallbackRedirect ??
    (tenant ? `/site/${tenant}` : undefined)
  return { tenant, redirectTo, explicitRedirect }
}
