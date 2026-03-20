'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Revision {
  number: number
  author: string
  date: string
  summary: string
}

export function useRevisions(name: string, tenantId: number | null) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api.get(`/api/articles/${name}/revisions?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: Revision[] = (res.data || []).map((r: Record<string, unknown>) => ({
          number: r.revisionNumber || r.id,
          author: r.authorUsername || 'Unknown',
          date: typeof r.createdAt === 'string' ? (r.createdAt as string).replace('T', ' ').substring(0, 16) : '',
          summary: r.summary || '',
        }))
        setRevisions(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId])

  const latestRevision = revisions[0]?.number ?? 0

  const handleRevert = (revNumber: number) => {
    if (!name) return Promise.reject()
    return api.post(`/api/articles/${name}/revert/${revNumber}`)
      .then(() => {
        // Refresh revisions
        api.get(`/api/articles/${name}/revisions?tenant_id=${tenantId}`)
          .then(res => {
            const mapped: Revision[] = (res.data || []).map((r: Record<string, unknown>) => ({
              number: r.revisionNumber || r.id,
              author: r.authorUsername || 'Unknown',
              date: typeof r.createdAt === 'string' ? (r.createdAt as string).replace('T', ' ').substring(0, 16) : '',
              summary: r.summary || '',
            }))
            setRevisions(mapped)
          })
      })
  }

  return { revisions, latestRevision, loading, handleRevert }
}
