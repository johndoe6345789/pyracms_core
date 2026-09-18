'use client'

import { useSearchParams } from 'next/navigation'

/** Only same-origin relative paths are honoured (no open redirect). */
export function safeRedirect(
  value: string | null,
): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) {
    return undefined
  }
  return value
}

/**
 * Reads `?tenant=<slug>` and `?redirect=<path>` from the URL. `tenant`
 * selects which site's accounts the auth pages talk to; without it the
 * platform (portal) account scope is used.
 */
export function useAuthParams(fallbackRedirect?: string) {
  const params = useSearchParams()
  const tenant = params.get('tenant') || undefined
  const redirectTo =
    safeRedirect(params.get('redirect'))
    ?? fallbackRedirect
    ?? (tenant ? `/site/${tenant}` : undefined)
  return { tenant, redirectTo }
}
