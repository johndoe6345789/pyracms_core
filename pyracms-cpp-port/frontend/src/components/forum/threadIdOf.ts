/** Thread id from the API's threadId, else from a /thread/{id} url. */
export function threadIdOf(item: Record<string, unknown>): string {
  if (item.threadId != null) return String(item.threadId)
  const m = /thread\/(\d+)/.exec(String(item.url ?? ''))
  return m?.[1] ?? ''
}
