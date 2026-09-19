'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { formatForumDate } from '@/lib/forumDate'

export interface ThreadSummary {
  id: string
  title: string
  author: string
  replies: number
  views: number
  lastPostDate: string
  pinned: boolean
  locked: boolean
}

export interface ForumInfo {
  name: string
  description: string
}

interface RawThread {
  id: number
  name?: string
  authorUsername?: string
  totalPosts?: number
  viewCount?: number
  lastPostAt?: string
  createdAt?: string
  pinned?: boolean
  locked?: boolean
}

export function useThreadList(forumId: string, tenantId: number | null) {
  const [forum, setForum] = useState<ForumInfo>({ name: '', description: '' })
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!forumId || !tenantId) return
    setLoading(true)
    setError('')
    api
      .get(`/api/forum/forums/${forumId}?tenant_id=${tenantId}`)
      .then((res) => {
        const data = res.data
        setForum({
          name: data.name || '',
          description: data.description || '',
        })
        const raw: RawThread[] = data.threads || []
        setThreads(
          raw.map((t) => ({
            id: String(t.id),
            title: t.name || '(untitled)',
            author: t.authorUsername || 'Unknown',
            replies: Math.max(0, (t.totalPosts || 0) - 1),
            views: t.viewCount || 0,
            lastPostDate: formatForumDate(t.lastPostAt || t.createdAt),
            pinned: Boolean(t.pinned),
            locked: Boolean(t.locked),
          })),
        )
      })
      .catch((err) =>
        setError(
          err?.response?.status === 404
            ? 'This forum does not exist.'
            : 'Could not load threads. Please try again.',
        ),
      )
      .finally(() => setLoading(false))
  }, [forumId, tenantId])

  return { forum, threads, loading, error }
}
