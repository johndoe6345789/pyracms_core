import api from '@/lib/api'

export interface ContentItem {
  name: string
  views: number
}

type Obj = Record<string, unknown>

/** Maps analytics top-content records. */
function mapTopContent(rows: Obj[]): ContentItem[] {
  return rows.map((item) => ({
    name: String(item.title || item.name || ''),
    views: Number(item.views || item.viewCount || 0),
  }))
}

/** Maps articles to the top 8 by view count. */
export function mapArticles(rows: Obj[]): ContentItem[] {
  return rows
    .map((a) => ({
      name: ((a.displayName as string) || '').substring(0, 25),
      views: Number(a.viewCount) || 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)
}

/**
 * Loads top content, falling back to article view counts.
 * @param tenantId - The tenant to load for.
 * @returns Items, or null when the analytics reply is unusable.
 */
export async function fetchTopContent(
  tenantId: number,
): Promise<ContentItem[] | null> {
  try {
    const res = await api.get(
      `/api/analytics/top-content?tenant_id=${tenantId}`,
    )
    return Array.isArray(res.data) ? mapTopContent(res.data) : null
  } catch {
    const res = await api.get(`/api/articles?tenant_id=${tenantId}`)
    return mapArticles(res.data || [])
  }
}
