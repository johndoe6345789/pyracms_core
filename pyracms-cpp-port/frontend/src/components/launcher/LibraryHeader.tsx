import { Box, Button, Typography } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'
import GetLauncherLink from './GetLauncherLink'
import LibraryFilters from './LibraryFilters'

interface Props extends React.ComponentProps<typeof LibraryFilters> {
  /** Link to the create page; omitted for guests */
  newHref?: string | undefined
  /** Site download page; shows the 'Need Hypernucleus?' link */
  downloadHref?: string | undefined
}

/** Title, launcher link and filters above the games grid. */
export default function LibraryHeader({ newHref, downloadHref, ...f }: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          Games
        </Typography>
        {newHref && (
          <Button
            component={Link}
            href={newHref}
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
      {downloadHref && <GetLauncherLink href={downloadHref} />}
      <LibraryFilters {...f} />
    </Box>
  )
}
