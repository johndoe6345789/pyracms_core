'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import { mapDetail } from '@/hooks/data/gameMappers'

export type GameDepType = 'game' | 'dep'

/** Loads one game/dependency page from the API. */
export function useGameDepItem(type: GameDepType, name: string) {
  const [item, setItem] = useState<GameDepDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let live = true
    setLoading(true)
    api.get(`/api/gamedep/${type}/${encodeURIComponent(name)}`)
      .then((r) => { if (live) setItem(mapDetail(r.data)) })
      .catch(() => { if (live) setItem(null) })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [type, name])

  return { item, loading }
}
