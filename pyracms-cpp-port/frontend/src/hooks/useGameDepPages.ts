'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { tenantParams } from '@/lib/tenantParams'
import type { GameDepItem } from '@/hooks/useGameDepList'
import { mapListItem } from '@/hooks/data/gameMappers'
import type { GameDepType } from '@/hooks/useGameDepItem'

/** Real list of games or dependencies for the list pages. */
export function useGameDepPages(type: GameDepType, slug: string) {
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const [items, setItems] = useState<GameDepItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tenantLoading) return
    api
      .get(`/api/gamedep/${type}?limit=100`, {
        params: tenantParams(tenantId),
      })
      .then((r) =>
        setItems(Array.isArray(r.data) ? r.data.map(mapListItem) : []),
      )
      .catch(() => setError('Could not load the list.'))
      .finally(() => setLoading(false))
  }, [type, tenantId, tenantLoading])

  return { items, loading, error }
}
