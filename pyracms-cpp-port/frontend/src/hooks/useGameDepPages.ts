'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import type { GameDepItem } from '@/hooks/useGameDepList'
import { mapListItem } from '@/hooks/data/gameMappers'
import type { GameDepType } from '@/hooks/useGameDepItem'

/** Real list of games or dependencies for the list pages. */
export function useGameDepPages(type: GameDepType) {
  const [items, setItems] = useState<GameDepItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/api/gamedep/${type}?limit=100`)
      .then((r) =>
        setItems(Array.isArray(r.data) ? r.data.map(mapListItem) : []),
      )
      .catch(() => setError('Could not load the list.'))
      .finally(() => setLoading(false))
  }, [type])

  return { items, loading, error }
}
