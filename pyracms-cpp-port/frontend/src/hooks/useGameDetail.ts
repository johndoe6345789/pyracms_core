import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import { mapDetail } from '@/hooks/data/gameMappers'

export function useGameDetail(name: string | null) {
  const [detail, setDetail] = useState<GameDepDetailData | null>(null)

  useEffect(() => {
    if (!name) {
      setDetail(null)
      return
    }
    let live = true
    api
      .get(`/api/gamedep/game/${encodeURIComponent(name)}`)
      .then((res) => {
        if (live) setDetail(mapDetail(res.data))
      })
      .catch(() => {
        if (live) setDetail(null)
      })
    return () => {
      live = false
    }
  }, [name])

  return detail
}
