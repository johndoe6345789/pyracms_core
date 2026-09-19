/** Turns an http(s) URL into a ws(s) URL carrying the auth token. */
export function buildWsUrl(url: string, token: string): string {
  const separator = url.includes('?') ? '&' : '?'
  const base = url.replace(/^http/, 'ws')
  return base + separator + 'token=' + encodeURIComponent(token)
}
