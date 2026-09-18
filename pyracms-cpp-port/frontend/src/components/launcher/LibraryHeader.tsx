import {
  Box, IconButton, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { MenuOutlined } from '@mui/icons-material'

export type LibraryView = 'library' | 'browse'

interface Props {
  mobile: boolean
  view: LibraryView
  onView: (v: LibraryView) => void
  onOpenDrawer: () => void
}

/** Title row: mobile menu button, heading and Library/Browse toggle. */
export default function LibraryHeader(p: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {p.mobile && (
        <IconButton aria-label="Open library" onClick={p.onOpenDrawer}>
          <MenuOutlined />
        </IconButton>
      )}
      <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
        Games
      </Typography>
      <ToggleButtonGroup
        exclusive size="small" value={p.view}
        onChange={(_, v) => v && p.onView(v)}
      >
        <ToggleButton value="library">Library</ToggleButton>
        <ToggleButton value="browse">Browse</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}
