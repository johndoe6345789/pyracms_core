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

export function useForumCategories(tenantId: number | null) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/forum/categories?tenant_id=${tenantId}`)
      .then(res => {
        const mapped: ForumCategory[] = (res.data || []).map((cat: Record<string, unknown>) => ({
          id: String(cat.id),
          name: cat.name,
          forums: (Array.isArray(cat.forums) ? cat.forums : []).map((f: Record<string, unknown>) => ({
            id: String(f.id),
            name: f.name,
            description: f.description || '',
            threads: f.totalThreads || 0,
            posts: f.totalPosts || 0,
          })),
        }))
        setCategories(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  return { categories, loading }
}
