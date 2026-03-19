'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface ThreadSummary {
  id: string
  title: string
  author: string
  replies: number
  views: number
  lastPostDate: string
  pinned: boolean
}

export interface ForumInfo {
  name: string
  description: string
}

export function useThreadList(forumId: string) {
  const [forum, setForum] = useState<ForumInfo>({ name: '', description: '' })
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!forumId) return
    setLoading(true)
    api.get(`/api/forum/forums/${forumId}`)
      .then(res => {
        const data = res.data
        setForum({ name: data.name || '', description: data.description || '' })
        const mapped: ThreadSummary[] = (data.threads || []).map((t: Record<string, unknown>) => ({
          id: String(t.id),
          title: t.title || '',
          author: t.authorUsername || 'Unknown',
          replies: Math.max(0, (Number(t.postCount) || 0) - 1),
          views: t.viewCount || 0,
          lastPostDate: typeof t.lastPostAt === 'string' ? (t.lastPostAt as string).replace('T', ' ').substring(0, 16) : '',
          pinned: t.pinned || false,
        }))
        setThreads(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [forumId])

  return { forum, threads, loading }
}
