/**
 * Where the backend API lives. Normally the site itself: nginx proxies
 * /api (including WebSockets) to the backend, so the page origin is right
 * on localhost, a VPS or CapRover alike. NEXT_PUBLIC_API_URL overrides it
 * for split deployments. There is deliberately no localhost fallback.
 */
export function apiOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL
  if (configured) return configured.replace(/\/$/, '')
  return typeof window === 'undefined' ? '' : window.location.origin
}

/** ws:// or wss:// URL for an API path, matching the page's scheme. */
export function wsUrl(path: string): string {
  return apiOrigin().replace(/^http/, 'ws') + path
}
