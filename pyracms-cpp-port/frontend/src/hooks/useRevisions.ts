'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Revision {
  number: number
  author: string
  date: string
  summary: string
}

function mapRevisions(data: Record<string, unknown>[]): Revision[] {
  return data.map(r => ({
    number: (r.revisionNumber as number) || (r.id as number),
    author: (r.authorUsername as string) || (
      typeof r.userId === 'number' && r.userId > 0
        ? `User #${r.userId}`
        : 'Deleted user'
    ),
    date: typeof r.createdAt === 'string'
      ? new Date((r.createdAt as string).replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'))
          .toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
      : '',
    summary: (r.summary as string) || '',
  }))
}

export function useRevisions(name: string, tenantId: number | null) {
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api.get(`/api/articles/${name}/revisions?tenant_id=${tenantId}`)
      .then(res => setRevisions(mapRevisions(res.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId])

  const latestRevision = revisions[0]?.number ?? 0

  const handleRevert = (revNumber: number) => {
    if (!name || !tenantId) return Promise.reject()
    return api.post(`/api/articles/${name}/revert/${revNumber}`, { tenant_id: tenantId })
      .then(() =>
        api.get(`/api/articles/${name}/revisions?tenant_id=${tenantId}`)
          .then(res => setRevisions(mapRevisions(res.data || [])))
      )
  }

  return { revisions, latestRevision, loading, handleRevert }
}
