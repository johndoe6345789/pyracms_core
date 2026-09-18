/** Human-readable message for a failed API call. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { error?: string } } }
    return e.response?.data?.error || fallback
  }
  return 'Unable to connect to server'
}
