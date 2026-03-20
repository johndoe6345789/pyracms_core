'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Site {
  slug: string
  name: string
  description: string
  owner: string
}

export function useTenantList() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/tenants')
      .then(res => {
        const mapped: Site[] = (res.data || []).map((t: Record<string, unknown>) => ({
          slug: t.slug || '',
          name: t.displayName || t.slug || '',
          description: t.description || '',
          owner: t.ownerUsername || 'admin',
        }))
        setSites(mapped)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sites, loading }
}
