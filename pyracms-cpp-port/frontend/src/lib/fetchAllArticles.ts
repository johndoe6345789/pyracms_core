import api from '@/lib/api'

const PAGE = 100
/** A safety stop (3,000 articles); the list endpoint pages at 100. */
const MAX_PAGES = 30

/**
 * Every article of a site, newest first. The list endpoint returns one page
 * (20 rows unless told otherwise), so a single call silently drops the rest:
 * read pages of 100 until one comes back short.
 */
export async function fetchAllArticles(
  tenantId: number,
  tag = '',
): Promise<Record<string, unknown>[]> {
  const suffix = tag ? `&tag=${encodeURIComponent(tag)}` : ''
  const out: Record<string, unknown>[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const offset = page * PAGE
    const res = await api.get(
      `/api/articles?tenant_id=${tenantId}&limit=${PAGE}&offset=${offset}` +
        suffix,
    )
    const rows: Record<string, unknown>[] = Array.isArray(res.data)
      ? res.data
      : []
    out.push(...rows)
    if (rows.length < PAGE) break
  }
  return out
}
