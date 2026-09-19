/** The API's own error text, or `fallback` when there is none. */
export function apiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: unknown } } }
  const msg = e?.response?.data?.error
  return typeof msg === 'string' && msg ? msg : fallback
}
