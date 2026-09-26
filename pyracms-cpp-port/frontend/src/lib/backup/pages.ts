import api from '@/lib/api'

const PAGE = 100

/** Reads every page of a list endpoint that takes limit/offset. */
export async function fetchAllPages<T>(
  url: string,
  params: Record<string, unknown>,
  pick: (data: unknown) => T[],
): Promise<T[]> {
  const all: T[] = []
  for (let offset = 0; ; offset += PAGE) {
    const res = await api.get(url, {
      params: { ...params, limit: PAGE, offset },
    })
    const rows = pick(res.data)
    all.push(...rows)
    if (rows.length < PAGE) return all
  }
}

/** Runs one restore step, recording a failure instead of stopping. */
export async function attempt(
  failed: string[],
  label: string,
  step: () => Promise<void>,
): Promise<boolean> {
  try {
    await step()
    return true
  } catch (err) {
    const e = err as { response?: { data?: { error?: string } } }
    failed.push(`${label}: ${e.response?.data?.error ?? 'failed'}`)
    return false
  }
}
