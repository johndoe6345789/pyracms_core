import api from '@/lib/api'
import { siteUrl } from '@/lib/searchUrl'

export interface SearchResult {
  type: string
  id: number
  title: string
  snippet: string
  url: string
  rank: number
  createdAt: string
}

export const SEARCH_ITEMS_PER_PAGE = 10

export interface SearchResponse {
  items: SearchResult[]
  totalCount: number
  facets: Record<string, number>
}

export async function fetchSearch(
  q: string,
  tenantId: string,
  type: string,
  pg: number,
  slug = '',
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q,
    tenant_id: tenantId,
    type: type === 'all' ? '' : type,
    limit: String(SEARCH_ITEMS_PER_PAGE),
    offset: String((pg - 1) * SEARCH_ITEMS_PER_PAGE),
  })
  const res = await api.get(`/api/search?${params}`)
  return {
    items: (res.data.items || []).map((i: SearchResult) => ({
      ...i,
      url: siteUrl(slug, i.url ?? ''),
    })),
    totalCount: res.data.totalCount || 0,
    facets: res.data.facets || {},
  }
}
