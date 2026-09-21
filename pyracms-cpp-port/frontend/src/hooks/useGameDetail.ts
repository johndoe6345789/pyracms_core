import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { tenantParams } from '@/lib/tenantParams'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import { mapDetail } from '@/hooks/data/gameMappers'

export function useGameDetail(name: string | null, slug: string) {
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const [detail, setDetail] = useState<GameDepDetailData | null>(null)

  useEffect(() => {
    if (tenantLoading) return
    if (!name) {
      setDetail(null)
      return
    }
    let live = true
    api
      .get(`/api/gamedep/game/${encodeURIComponent(name)}`, {
        params: tenantParams(tenantId),
      })
      .then((res) => {
        if (live) setDetail(mapDetail(res.data))
      })
      .catch(() => {
        if (live) setDetail(null)
      })
    return () => {
      live = false
    }
  }, [name, tenantId, tenantLoading])

  return detail
}
