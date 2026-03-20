import { useState, useMemo } from 'react'

export interface GameDepItem {
  name: string
  displayName: string
  description: string
  tags: string[]
  likes: number
  dislikes: number
  views: number
  created: string
}

export function useGameDepList(
  items: GameDepItem[],
  availableTags: string[]
) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('votes')
  const [filterTag, setFilterTag] = useState('')

  const filtered = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.displayName.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
        const matchesTag = !filterTag || item.tags.includes(filterTag)
        return matchesSearch && matchesTag
      })
      .sort((a, b) => {
        if (sortBy === 'votes') return b.likes - a.likes
        if (sortBy === 'views') return b.views - a.views
        if (sortBy === 'date')
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        return 0
      })
  }, [items, search, sortBy, filterTag])

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
    filtered,
    availableTags,
  }
}
