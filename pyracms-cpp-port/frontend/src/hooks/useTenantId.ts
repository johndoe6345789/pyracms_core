'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

const cache: Record<string, number> = {}

export function useTenantId(slug: string) {
  const [tenantId, setTenantId] = useState<number | null>(cache[slug] ?? null)
  const [loading, setLoading] = useState(!cache[slug])

  useEffect(() => {
    if (!slug) return
    if (cache[slug]) {
      setTenantId(cache[slug])
      setLoading(false)
      return
    }
    api.get(`/api/tenants/${slug}`)
      .then(res => {
        const id = res.data.id
        cache[slug] = id
        setTenantId(id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  return { tenantId, loading }
}
