'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import type { GameDepItem } from '@/hooks/useGameDepList'
import { PLACEHOLDER_GAMES } from '@/hooks/data/gamePlaceholders'
import { mapListItem } from '@/hooks/data/gameMappers'
import { installedStore, favouriteStore } from '@/lib/launcher'

export { mapListItem, mapDetail } from '@/hooks/data/gameMappers'
export { useGameDetail } from '@/hooks/useGameDetail'

export type LibraryFilter = 'all' | 'installed' | 'favourites'

type Marks = Record<string, string>

export function filterGames(
  games: GameDepItem[], search: string, tag: string,
  filter: LibraryFilter, installed: Marks, favs: Marks,
): GameDepItem[] {
  const q = search.toLowerCase()
  const has = (g: GameDepItem) => filter === 'installed'
    ? !!installed[g.name] : !!favs[g.name]
  return games
    .filter((g) => !q || g.displayName.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q))
    .filter((g) => !tag || g.tags.includes(tag))
    .filter((g) => filter === 'all' || has(g))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export function useGameLibrary() {
  const [games, setGames] = useState<GameDepItem[]>([])
  const [sample, setSample] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [tag, setTag] = useState('')
  const [installed, setInstalled] = useState<Record<string, string>>({})
  const [favs, setFavs] = useState<Record<string, string>>({})

  useEffect(() => {
    setInstalled(installedStore.get())
    setFavs(favouriteStore.get())
    api.get('/api/gamedep/game?limit=100')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : []
        if (rows.length > 0) setGames(rows.map(mapListItem))
        else { setGames(PLACEHOLDER_GAMES); setSample(true) }
      })
      .catch(() => { setGames(PLACEHOLDER_GAMES); setSample(true) })
      .finally(() => setLoading(false))
  }, [])

  const tags = useMemo(
    () => Array.from(new Set(games.flatMap((g) => g.tags))).sort(),
    [games])

  const visible = useMemo(
    () => filterGames(games, search, tag, filter, installed, favs),
    [games, search, tag, filter, installed, favs])

  const markInstalled = (name: string, version: string) => {
    installedStore.set(name, version); setInstalled(installedStore.get())
  }
  const unmark = (name: string) => {
    installedStore.remove(name); setInstalled(installedStore.get())
  }
  const toggleFav = (name: string) => setFavs(favouriteStore.toggle(name))

  return {
    games, visible, sample, loading, search, setSearch, filter, setFilter,
    tag, setTag, tags, installed, favs, markInstalled, unmark, toggleFav,
  }
}
