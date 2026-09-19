/**
 * Per-scope sessions.
 *
 * Accounts belong to a site (or to the platform), so each scope keeps its
 * own token: `token:<slug>` for a site, plain `token` for the platform.
 * Signing out of one site therefore never touches another site's session.
 */

const PLATFORM_KEY = 'token'

/** Site slug for a `/site/<slug>/...` path, or null on portal pages. */
export function scopeFromPath(
  pathname: string | null | undefined,
): string | null {
  const m = pathname?.match(/^\/site\/([^/]+)/)
  return m?.[1] ? decodeURIComponent(m[1]) : null
}

function keyFor(scope: string | null): string {
  return scope ? `${PLATFORM_KEY}:${scope}` : PLATFORM_KEY
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Where this scope's token actually lives, if anywhere. */
function activeKey(scope: string | null): string | null {
  const own = keyFor(scope)
  if (read(own)) return own
  // A platform account (e.g. the site's owner) is valid on any site
  if (scope && read(PLATFORM_KEY)) return PLATFORM_KEY
  return null
}

export function getToken(scope: string | null): string | null {
  const key = activeKey(scope)
  return key ? read(key) : null
}

export function currentToken(): string | null {
  if (typeof window === 'undefined') return null
  return getToken(scopeFromPath(window.location.pathname))
}

export function setToken(scope: string | null, token: string): void {
  localStorage.setItem(keyFor(scope), token)
}

/** Forget only the session used in `scope`; other sites stay signed in. */
export function clearToken(scope: string | null): void {
  const key = activeKey(scope)
  if (key) localStorage.removeItem(key)
}

/**
 * Swap in a fresh token (e.g. after a password change) in the slot the
 * scope is really using, which may be the platform token.
 */
export function replaceToken(scope: string | null, token: string): void {
  const key = activeKey(scope)
  if (key) localStorage.setItem(key, token)
  else setToken(scope, token)
}
