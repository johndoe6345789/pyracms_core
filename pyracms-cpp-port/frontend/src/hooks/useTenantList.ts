'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface Site {
  slug: string
  name: string
  description: string
  owner: string
}

const mapSite = (t: Record<string, unknown>): Site => ({
  slug: (t.slug || '') as string,
  name: (t.displayName || t.slug || '') as string,
  description: (t.description || '') as string,
  owner: (t.ownerUsername || 'admin') as string,
})

export function useTenantList() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/tenants')
      .then(res => setSites((res.data || []).map(mapSite)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { sites, loading }
}
