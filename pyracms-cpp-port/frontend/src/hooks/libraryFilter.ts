import type { GameDepItem } from '@/hooks/useGameDepList'

export type LibraryFilter = 'all' | 'installed' | 'favourites'

export type Marks = Record<string, string>

export function filterGames(
  games: GameDepItem[],
  search: string,
  tag: string,
  filter: LibraryFilter,
  installed: Marks,
  favs: Marks,
): GameDepItem[] {
  const q = search.toLowerCase()
  const has = (g: GameDepItem) =>
    filter === 'installed' ? !!installed[g.name] : !!favs[g.name]
  return games
    .filter(
      (g) =>
        !q ||
        g.displayName.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q),
    )
    .filter((g) => !tag || g.tags.includes(tag))
    .filter((g) => filter === 'all' || has(g))
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
}
