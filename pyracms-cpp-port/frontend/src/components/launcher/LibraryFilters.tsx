import {
  Box,
  Chip,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import type { LibraryFilter } from '@/hooks/libraryFilter'

interface Props {
  search: string
  onSearch: (s: string) => void
  filter: LibraryFilter
  onFilter: (f: LibraryFilter) => void
  tags: string[]
  tag: string
  onTag: (t: string) => void
}

/** Search box, All/Installed/Favourites toggle and tag chips. */
export default function LibraryFilters(p: Props) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search games"
          value={p.search}
          onChange={(e) => p.onSearch(e.target.value)}
          inputProps={{ 'aria-label': 'Search games' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { xs: '100%', sm: 260 } }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={p.filter}
          onChange={(_, v) => v && p.onFilter(v)}
          aria-label="Library filter"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="installed">Installed</ToggleButton>
          <ToggleButton value="favourites">Favourites</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 2 }}>
        {p.tags.map((t) => (
          <Chip
            key={t}
            label={t}
            size="small"
            color={p.tag === t ? 'primary' : 'default'}
            variant={p.tag === t ? 'filled' : 'outlined'}
            onClick={() => p.onTag(p.tag === t ? '' : t)}
          />
        ))}
      </Box>
    </>
  )
}
