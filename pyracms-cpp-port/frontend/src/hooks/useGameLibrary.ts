'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { useTenantId } from '@/hooks/useTenantId'
import { tenantParams } from '@/lib/tenantParams'
import type { GameDepItem } from '@/hooks/useGameDepList'
import { filterGames, type LibraryFilter } from './libraryFilter'
import { mapListItem } from '@/hooks/data/gameMappers'
import { installedStore, favouriteStore } from '@/lib/launcher'

export { mapListItem, mapDetail } from '@/hooks/data/gameMappers'

export { filterGames }
export type { LibraryFilter }

export function useGameLibrary(slug: string) {
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const [games, setGames] = useState<GameDepItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [tag, setTag] = useState('')
  const [installed, setInstalled] = useState<Record<string, string>>({})
  const [favs, setFavs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (tenantLoading) return
    setInstalled(installedStore.get())
    setFavs(favouriteStore.get())
    api
      .get('/api/gamedep/game?limit=100', { params: tenantParams(tenantId) })
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : []
        setGames(rows.map(mapListItem))
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false))
  }, [tenantId, tenantLoading])

  const tags = useMemo(
    () => Array.from(new Set(games.flatMap((g) => g.tags))).sort(),
    [games],
  )

  const visible = useMemo(
    () => filterGames(games, search, tag, filter, installed, favs),
    [games, search, tag, filter, installed, favs],
  )

  const markInstalled = (name: string, version: string) => {
    installedStore.set(name, version)
    setInstalled(installedStore.get())
  }
  const unmark = (name: string) => {
    installedStore.remove(name)
    setInstalled(installedStore.get())
  }
  const toggleFav = (name: string) => setFavs(favouriteStore.toggle(name))

  return {
    games,
    visible,
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    tag,
    setTag,
    tags,
    installed,
    favs,
    markInstalled,
    unmark,
    toggleFav,
  }
}
