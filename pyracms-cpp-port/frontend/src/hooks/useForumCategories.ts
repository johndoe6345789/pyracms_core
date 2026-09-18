'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Forum {
  id: string
  name: string
  description: string
  threads: number
  posts: number
}

export interface ForumCategory {
  id: string
  name: string
  forums: Forum[]
}

interface RawForum {
  id: number
  name: string
  description?: string
  totalThreads?: number
  totalPosts?: number
}

interface RawCategory {
  id: number
  name: string
  forums?: RawForum[]
}

export function useForumCategories(tenantId: number | null) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    setError('')
    api.get(`/api/forum/categories?tenant_id=${tenantId}`)
      .then(res => {
        const raw: RawCategory[] = Array.isArray(res.data) ? res.data : []
        setCategories(raw.map(cat => ({
          id: String(cat.id),
          name: cat.name,
          forums: (cat.forums ?? []).map(f => ({
            id: String(f.id),
            name: f.name,
            description: f.description || '',
            threads: f.totalThreads || 0,
            posts: f.totalPosts || 0,
          })),
        })))
      })
      .catch(() => setError('Could not load the forum. Please try again.'))
      .finally(() => setLoading(false))
  }, [tenantId])

  return { categories, loading, error }
}
