import api from '@/lib/api'
import { siteUrl } from '@/lib/searchUrl'
import {
  PAGE_SIZE,
  type SearchHit,
  type SearchPage,
  type Suggestion,
} from './types'

type Raw = Record<string, unknown>
const text = (v: unknown) => (typeof v === 'string' ? v : '')

function hitOf(r: Raw, slug: string): SearchHit {
  return {
    type: text(r.type),
    id: Number(r.id) || 0,
    title: text(r.title),
    titleMarked: text(r.titleMarked),
    snippet: text(r.snippet),
    url: siteUrl(slug, text(r.url)),
    createdAt: text(r.createdAt),
    author: text(r.author),
    tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
  }
}

/** One page of results for a site. `type` 'all' means every kind. */
export async function fetchSearch(
  slug: string,
  tenantId: number,
  q: string,
  type: string,
  page: number,
): Promise<SearchPage> {
  const params = {
    q,
    tenant_id: tenantId,
    type: type === 'all' ? '' : type,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }
  const { data } = await api.get('/api/search', { params })
  return {
    items: ((data.items ?? []) as Raw[]).map((r) => hitOf(r, slug)),
    totalCount: Number(data.totalCount) || 0,
    facets: data.facets ?? {},
  }
}

/** The handful of hits offered while typing. */
export async function fetchSuggestions(
  slug: string,
  tenantId: number,
  q: string,
): Promise<Suggestion[]> {
  const { data } = await api.get('/api/search/autocomplete', {
    params: { q, tenant_id: tenantId, limit: 6 },
  })
  return ((data.items ?? data ?? []) as Raw[]).map((r) => ({
    type: text(r.type) || 'article',
    title: text(r.title) || text(r.text),
    snippet: text(r.snippet),
    url: siteUrl(slug, text(r.url) || '#'),
  }))
}
