import { Box } from '@mui/material'
import type { GameDepItem } from '@/hooks/useGameDepList'
import type { LibraryFilter } from '@/hooks/useGameLibrary'
import SidebarFilters from './SidebarFilters'
import SidebarTags from './SidebarTags'
import SidebarList from './SidebarList'

interface Props {
  games: GameDepItem[]
  selected: string | null
  onSelect: (name: string) => void
  search: string
  onSearch: (v: string) => void
  filter: LibraryFilter
  onFilter: (f: LibraryFilter) => void
  tags: string[]
  tag: string
  onTag: (t: string) => void
  installed: Record<string, string>
  favs: Record<string, string>
}

export default function LibrarySidebar(p: Props) {
  return (
    <Box
      data-testid="library-sidebar"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <SidebarFilters
        search={p.search} onSearch={p.onSearch}
        filter={p.filter} onFilter={p.onFilter}
      />
      <SidebarTags tags={p.tags} tag={p.tag} onTag={p.onTag} />
      <SidebarList
        games={p.games} selected={p.selected} onSelect={p.onSelect}
        installed={p.installed} favs={p.favs}
      />
    </Box>
  )
}
