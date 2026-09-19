/** Turns an http(s) URL into a ws(s) URL carrying the auth token. */
export function buildWsUrl(url: string, token: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return url.replace(/^http/, 'ws') + separator + 'token=' + encodeURIComponent(token)
}
