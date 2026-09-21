'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { tenantParams } from '@/lib/tenantParams'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import { mapDetail } from '@/hooks/data/gameMappers'

export type GameDepType = 'game' | 'dep'

/** Loads one game/dependency page from the API. */
export function useGameDepItem(type: GameDepType, name: string, slug: string) {
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const [item, setItem] = useState<GameDepDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tenantLoading) return
    let live = true
    setLoading(true)
    api
      .get(`/api/gamedep/${type}/${encodeURIComponent(name)}`, {
        params: tenantParams(tenantId),
      })
      .then((r) => {
        if (live) setItem(mapDetail(r.data))
      })
      .catch(() => {
        if (live) setItem(null)
      })
      .finally(() => {
        if (live) setLoading(false)
      })
    return () => {
      live = false
    }
  }, [type, name, tenantId, tenantLoading])

  return { item, loading }
}
