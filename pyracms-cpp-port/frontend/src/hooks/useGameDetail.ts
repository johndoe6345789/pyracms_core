import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import {
  PLACEHOLDER_GAMES, PLACEHOLDER_GAME_DETAIL,
} from '@/hooks/data/gamePlaceholders'
import { mapDetail } from '@/hooks/data/gameMappers'

export function useGameDetail(name: string | null, sample: boolean) {
  const [detail, setDetail] = useState<GameDepDetailData | null>(null)

  useEffect(() => {
    if (!name) { setDetail(null); return }
    if (sample) {
      const g = PLACEHOLDER_GAMES.find((x) => x.name === name)
      setDetail({
        ...PLACEHOLDER_GAME_DETAIL, name,
        displayName: g?.displayName ?? name,
        description: g?.description ?? '',
        tags: g?.tags ?? [],
        views: g?.views ?? 0,
      })
      return
    }
    let live = true
    api.get(`/api/gamedep/game/${encodeURIComponent(name)}`)
      .then((res) => { if (live) setDetail(mapDetail(res.data)) })
      .catch(() => { if (live) setDetail(null) })
    return () => { live = false }
  }, [name, sample])

  return detail
}
