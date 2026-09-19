'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export interface SnippetComment {
  id: string
  author: string
  body: string
  date: string
}

type Raw = Record<string, unknown>

function mapComment(c: Raw): SnippetComment {
  return {
    id: String(c.id),
    author: String(c.username || 'Unknown'),
    body: String(c.body ?? ''),
    date: String(c.createdAt ?? '').replace('T', ' ').substring(0, 16),
  }
}

/** Loads and posts comments for a snippet. */
export function useSnippetComments(id: string) {
  const [comments, setComments] = useState<SnippetComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() =>
    api.get(`/api/comments/snippet/${id}`)
      .then((res) => {
        const raw: Raw[] = Array.isArray(res.data) ? res.data : []
        setComments(raw.map(mapComment))
      })
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false)), [id])

  useEffect(() => { load() }, [load])

  const post = (body: string) =>
    api.post(`/api/comments/snippet/${id}`, { body })
      .then(() => {
        setError('')
        return load().then(() => true)
      })
      .catch((e) => {
        setError(e?.response?.status === 401
          ? 'Log in to post a comment.'
          : 'Could not post your comment.')
        return false
      })

  return { comments, loading, error, post }
}
