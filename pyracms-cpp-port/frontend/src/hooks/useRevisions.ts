'use client'

import { useState, useEffect, useMemo } from 'react'
import api from '@/lib/api'
import { formatDateTime } from './articleDate'
import type { DiffRevision } from '@/components/articles/RevisionSelect'

export interface Revision {
  number: number
  author: string
  date: string
  summary: string
}

export function mapRevisions(data: Record<string, unknown>[]): Revision[] {
  return data.map((r) => ({
    number: (r.revisionNumber as number) || (r.id as number),
    author:
      (r.authorUsername as string) ||
      (typeof r.userId === 'number' && r.userId > 0
        ? `User #${r.userId}`
        : 'Deleted user'),
    date: typeof r.createdAt === 'string' ? formatDateTime(r.createdAt) : '',
    summary: (r.summary as string) || '',
  }))
}

/** Oldest first: "from" defaults to oldest, "to" to newest. */
export function mapDiffRevisions(
  data: Record<string, unknown>[],
): DiffRevision[] {
  const rows = mapRevisions(data)
  return data
    .map((r, i) => ({
      id: String(r.id ?? rows[i]?.number),
      label: `Revision #${rows[i]?.number}`,
      date: rows[i]?.date ?? '',
      author: rows[i]?.author ?? '',
      content: typeof r.content === 'string' ? r.content : '',
    }))
    .reverse()
}

export function useRevisions(name: string, tenantId: number | null) {
  const [raw, setRaw] = useState<Record<string, unknown>[]>([])
  const revisions = useMemo(() => mapRevisions(raw), [raw])
  const diffs = useMemo(() => mapDiffRevisions(raw), [raw])
  const [loading, setLoading] = useState(true)
  const listUrl = `/api/articles/${name}/revisions?tenant_id=${tenantId}`

  useEffect(() => {
    if (!name || !tenantId) return
    setLoading(true)
    api
      .get(listUrl)
      .then((res) => setRaw(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [name, tenantId, listUrl])

  const latestRevision = revisions[0]?.number ?? 0

  const handleRevert = (revNumber: number) => {
    if (!name || !tenantId) return Promise.reject()
    return api
      .post(`/api/articles/${name}/revert/${revNumber}`, {
        tenant_id: tenantId,
      })
      .then(() => api.get(listUrl))
      .then((res) => setRaw(res.data || []))
  }

  return { revisions, diffs, latestRevision, loading, handleRevert }
}
