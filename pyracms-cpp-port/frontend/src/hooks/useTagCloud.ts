'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export interface TagCloudItem {
  name: string
  count: number
}

export function useTagCloud(tenantId: number | null) {
  const [tags, setTags] = useState<TagCloudItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    api.get(`/api/articles/tags/cloud?tenant_id=${tenantId}`)
      .then((res) => setTags(res.data || []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false))
  }, [tenantId])

  return { tags, loading }
}
