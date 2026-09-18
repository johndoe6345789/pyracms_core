import {
  Box, TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material'
import type { LibraryFilter } from '@/hooks/useGameLibrary'

interface Props {
  search: string
  onSearch: (v: string) => void
  filter: LibraryFilter
  onFilter: (f: LibraryFilter) => void
}

/** Search box plus All / Installed / Favourites toggle. */
export default function SidebarFilters(p: Props) {
  return (
    <Box sx={{ p: 1.5 }}>
      <TextField
        size="small" fullWidth placeholder="Search library"
        value={p.search} onChange={(e) => p.onSearch(e.target.value)}
        inputProps={{ 'aria-label': 'Search library' }}
      />
      <ToggleButtonGroup
        exclusive size="small" fullWidth value={p.filter} sx={{ mt: 1 }}
        onChange={(_, v: LibraryFilter | null) => v && p.onFilter(v)}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="installed">Installed</ToggleButton>
        <ToggleButton value="favourites">Favourites</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
