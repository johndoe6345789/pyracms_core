import { useState } from 'react'
import api from '@/lib/api'

export interface ForumSearchResult {
  id: string
  threadTitle: string
  postContent: string
  author: string
  date: string
  forumName: string
}

interface SearchState {
  results: ForumSearchResult[]
  hasSearched: boolean
}

type R = Record<string, unknown>

export function useForumSearch(
  tenantId?: number | null
) {
  const [state, setState] =
    useState<SearchState>({
      results: [], hasSearched: false,
    })

  const search = (
    query: string,
    author: string,
    forum: string,
  ) => {
    const p = new URLSearchParams()
    if (query) p.set('q', query)
    if (tenantId)
      p.set('tenant_id', String(tenantId))
    p.set('type', 'forum_post')
    api.get(`/api/search?${p.toString()}`)
      .then(res => {
        const items =
          res.data.items || res.data || []
        let mapped: ForumSearchResult[] =
          items.map((item: R) => ({
            id: String(item.id),
            threadTitle: item.title || '',
            postContent: item.snippet
              || item.content || '',
            author: item.author || '',
            date:
              typeof item.createdAt === 'string'
                ? (item.createdAt as string)
                    .split('T')[0] : '',
            forumName: item.forumName || '',
          }))
        if (author)
          mapped = mapped.filter(r =>
            r.author.toLowerCase()
              .includes(author.toLowerCase()))
        if (forum)
          mapped = mapped.filter(
            r => r.forumName === forum)
        setState({
          results: mapped, hasSearched: true,
        })
      })
      .catch(() => {
        setState({
          results: [], hasSearched: true,
        })
      })
  }

  return { ...state, search }
}
