import {
  Box, Button, IconButton, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { AddOutlined, MenuOutlined } from '@mui/icons-material'
import Link from 'next/link'
import GetLauncherLink from './GetLauncherLink'

export type LibraryView = 'library' | 'browse'

interface Props {
  mobile: boolean
  view: LibraryView
  onView: (v: LibraryView) => void
  onOpenDrawer: () => void
  /** Link to the create page; omitted for guests */
  newHref?: string | undefined
  /** Site download page; shows the 'Need Hypernucleus?' link */
  downloadHref?: string | undefined
}

/** Title row: mobile menu button, heading and Library/Browse toggle. */
export default function LibraryHeader(p: Props) {
  return (
    <>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      {p.mobile && (
        <IconButton aria-label="Open library" onClick={p.onOpenDrawer}>
          <MenuOutlined />
        </IconButton>
      )}
      <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
        Games
      </Typography>
      {p.newHref && (
        <Button component={Link} href={p.newHref} size="small"
          startIcon={<AddOutlined />} data-testid="new-game-btn">
          New game
        </Button>
      )}
      <ToggleButtonGroup
        exclusive size="small" value={p.view}
        onChange={(_, v) => v && p.onView(v)}
      >
        <ToggleButton value="library">Library</ToggleButton>
        <ToggleButton value="browse">Browse</ToggleButton>
      </ToggleButtonGroup>
    </Box>
    {p.downloadHref && <GetLauncherLink href={p.downloadHref} />}
    </>
  )
}
