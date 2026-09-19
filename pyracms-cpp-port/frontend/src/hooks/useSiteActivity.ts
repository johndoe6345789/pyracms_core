'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export interface SiteActivity {
  id: number
  type: string
  actor: string
  title: string
  link: string
  createdAt: string
}

/** Recent tenant activity from GET /api/activity. */
export function useSiteActivity(tenantId: number | null, limit = 10) {
  const [items, setItems] = useState<SiteActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!tenantId) return
    api.get(`/api/activity?tenant_id=${tenantId}&limit=${limit}`)
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [tenantId, limit])
  return { items, loading, failed }
}
