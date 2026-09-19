import { safeRedirect } from '@/hooks/useAuthParams'

export const OAUTH_PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'google', label: 'Google' },
  { id: 'discord', label: 'Discord' },
] as const

const KEY = 'oauth:pending'

interface Pending {
  provider: string
  redirectTo?: string
}

/** Remember which provider/redirect the round trip belongs to. */
export function stashOAuth(provider: string, redirectTo?: string): void {
  try {
    const v: Pending = { provider, ...(redirectTo ? { redirectTo } : {}) }
    sessionStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* storage blocked: callback reports the failure */
  }
}

export function takeOAuth(): Pending | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    const v = raw ? JSON.parse(raw) : null
    if (!v || typeof v.provider !== 'string') return null
    const redirectTo = safeRedirect(v.redirectTo ?? null)
    return { provider: v.provider, ...(redirectTo ? { redirectTo } : {}) }
  } catch {
    return null
  }
}

/** Only http(s) absolute URLs are followed to the provider. */
export function isProviderUrl(url: unknown): url is string {
  try {
    return ['http:', 'https:'].includes(new URL(String(url)).protocol)
  } catch {
    return false
  }
}
