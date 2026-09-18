import {
  Box, TextField, ToggleButton, ToggleButtonGroup, List,
  ListItemButton, ListItemText, ListItemIcon, Collapse, Typography,
  Chip,
} from '@mui/material'
import { FavoriteOutlined, ExpandLess, ExpandMore } from '@mui/icons-material'
import { useState } from 'react'
import type { GameDepItem } from '@/hooks/useGameDepList'
import type { LibraryFilter } from '@/hooks/useGameLibrary'

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
  const [open, setOpen] = useState(true)
  return (
    <Box data-testid="library-sidebar"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1.5 }}>
        <TextField size="small" fullWidth placeholder="Search library"
          value={p.search} onChange={(e) => p.onSearch(e.target.value)}
          inputProps={{ 'aria-label': 'Search library' }} />
        <ToggleButtonGroup exclusive size="small" fullWidth
          value={p.filter} sx={{ mt: 1 }}
          onChange={(_, v: LibraryFilter | null) => v && p.onFilter(v)}>
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="installed">Installed</ToggleButton>
          <ToggleButton value="favourites">Favourites</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <ListItemButton onClick={() => setOpen(!open)} dense>
        <ListItemText primary="Categories" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>
        <Box sx={{ px: 1.5, pb: 1, display: 'flex', flexWrap: 'wrap',
          gap: 0.5 }}>
          {p.tags.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No tags yet.
            </Typography>
          )}
          {p.tags.map((t) => (
            <Chip key={t} label={t} size="small"
              color={p.tag === t ? 'primary' : 'default'}
              onClick={() => p.onTag(p.tag === t ? '' : t)} />
          ))}
        </Box>
      </Collapse>
      <List dense sx={{ overflowY: 'auto', flex: 1 }}>
        {p.games.map((g) => (
          <ListItemButton key={g.name} selected={p.selected === g.name}
            onClick={() => p.onSelect(g.name)}>
            <ListItemText primary={g.displayName}
              secondary={p.installed[g.name]
                ? `Marked installed v${p.installed[g.name]}` : undefined} />
            {p.favs[g.name] && (
              <ListItemIcon sx={{ minWidth: 0 }}>
                <FavoriteOutlined fontSize="small" color="error" />
              </ListItemIcon>
            )}
          </ListItemButton>
        ))}
        {p.games.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No games match.
          </Typography>
        )}
      </List>
    </Box>
  )
}
