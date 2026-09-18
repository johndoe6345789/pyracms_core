'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import type { GameDepItem } from '@/hooks/useGameDepList'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import {
  PLACEHOLDER_GAMES, PLACEHOLDER_GAME_DETAIL,
} from '@/hooks/data/gamePlaceholders'
import { installedStore, favouriteStore } from '@/lib/launcher'

export type LibraryFilter = 'all' | 'installed' | 'favourites'

const asStr = (v: unknown): string => (typeof v === 'string' ? v : '')
const day = (v: unknown) => asStr(v).split('T')[0] ?? ''

export function mapListItem(r: Record<string, unknown>): GameDepItem {
  return {
    name: asStr(r.name),
    displayName: asStr(r.displayName) || asStr(r.name),
    description: asStr(r.description),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    likes: Number(r.likes ?? 0),
    dislikes: Number(r.dislikes ?? 0),
    views: Number(r.viewCount ?? 0),
    created: day(r.createdAt),
  }
}

export function mapDetail(r: Record<string, unknown>): GameDepDetailData {
  const revs = Array.isArray(r.revisions) ? r.revisions : []
  const list = mapListItem(r)
  return {
    name: list.name,
    displayName: list.displayName,
    description: list.description,
    owner: r.ownerId ? `user #${String(r.ownerId)}` : 'Unknown',
    created: list.created,
    views: list.views,
    likes: list.likes,
    dislikes: list.dislikes,
    tags: list.tags,
    revisions: revs.map((v: Record<string, unknown>) => ({
      version: asStr(v.version),
      published: Boolean(v.published),
      date: day(v.createdAt),
    })),
    binaries: [],
    dependencies: [],
    screenshots: [],
  }
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

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    return games
      .filter((g) => !q || g.displayName.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q))
      .filter((g) => !tag || g.tags.includes(tag))
      .filter((g) => filter === 'all' ||
        (filter === 'installed' ? !!installed[g.name] : !!favs[g.name]))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }, [games, search, tag, filter, installed, favs])

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
