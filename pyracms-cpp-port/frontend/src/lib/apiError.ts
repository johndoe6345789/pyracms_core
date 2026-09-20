/** Human-readable message for a failed API call. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as { response?: { data?: { error?: string } } }
    return e.response?.data?.error || fallback
  }
  return 'Unable to connect to server'
}

/**
 * Extra context for a failed call, shown behind a "details" arrow: what was
 * requested, the HTTP status, and the server's own words.
 */
export function apiErrorDetails(err: unknown, request: string): string {
  const lines = [`Request: ${request}`]
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (
      err as {
        response?: { status?: number; data?: { error?: string } }
      }
    ).response
    if (r?.status) lines.push(`Status: ${r.status}`)
    if (r?.data?.error) lines.push(`Server said: ${r.data.error}`)
  } else {
    lines.push('No response from the server')
  }
  return lines.join('\n')
}
