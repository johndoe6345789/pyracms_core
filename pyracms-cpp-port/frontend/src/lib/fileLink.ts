import api from '@/lib/api'

const LEEWAY = 60 // seconds before expiry when a link is renewed
const cache = new Map<string, { query: string; exp: number }>()

/**
 * The `exp=..&sig=..` query that lets a plain <img> or link open a
 * signed-in-only file (browsers cannot send the Bearer header there).
 * Links live 15 minutes; one is reused until shortly before it ends.
 */
export async function fileLinkQuery(uuid: string): Promise<string> {
  const now = Date.now() / 1000
  const hit = cache.get(uuid)
  if (hit && hit.exp - LEEWAY > now) return hit.query
  const { data } = await api.post(
    `/api/files/${encodeURIComponent(uuid)}/link`,
    {},
  )
  cache.set(uuid, { query: data.query, exp: data.exp })
  return data.query as string
}

/** Adds a signed-link query to a file URL (no-op without one). */
export function withLink(url: string, query: string): string {
  if (!url || !query) return url
  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}
