export const MAX_TRIES = 4

/** True for aborts, which must never be retried. */
export function isAbort(err: unknown): boolean {
  const e = err as { code?: string; name?: string }
  return e?.code === 'ERR_CANCELED' || e?.name === 'AbortError'
}

/** Network errors, 408, 429 and 5xx are worth retrying; other 4xx not. */
export function retryable(err: unknown): boolean {
  if (isAbort(err)) return false
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === undefined) return true
  return status === 408 || status === 429 || status >= 500
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      resolve()
    })
  })
}

/** Runs fn with exponential backoff (base, 2*base, 4*base ...). */
export async function withRetry<T>(
  fn: () => Promise<T>,
  baseMs = 500,
  signal?: AbortSignal,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt >= MAX_TRIES || !retryable(err) || signal?.aborted) {
        throw err
      }
      await sleep(baseMs * 2 ** (attempt - 1), signal)
    }
  }
}
