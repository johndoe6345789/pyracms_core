import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'
import Link from 'next/link'
import type { LibraryFilter } from '@/hooks/libraryFilter'
import GetLauncherLink from './GetLauncherLink'

interface Props {
  search: string
  onSearch: (s: string) => void
  filter: LibraryFilter
  onFilter: (f: LibraryFilter) => void
  tags: string[]
  tag: string
  onTag: (t: string) => void
  /** Link to the create page; omitted for guests */
  newHref?: string | undefined
  /** Site download page; shows the 'Need Hypernucleus?' link */
  downloadHref?: string | undefined
}

/** Title, search, library filter and tag chips above the games grid. */
export default function LibraryHeader(p: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          Games
        </Typography>
        {p.newHref && (
          <Button
            component={Link}
            href={p.newHref}
            startIcon={<AddOutlined />}
            data-testid="new-game-btn"
          >
            New game
          </Button>
        )}
      </Box>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Download a game, install it with the Hypernucleus launcher and play.
      </Typography>
      {p.downloadHref && <GetLauncherLink href={p.downloadHref} />}
      <Box
        sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
      >
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
      {p.tags.length > 0 && (
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
      )}
    </Box>
  )
}
