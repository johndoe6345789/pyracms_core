import { Box, Button, Typography } from '@mui/material'
import { AddOutlined, ExtensionOutlined } from '@mui/icons-material'
import Link from 'next/link'
import GetLauncherLink from './GetLauncherLink'
import LibraryFilters from './LibraryFilters'

interface Props extends React.ComponentProps<typeof LibraryFilters> {
  /** Link to the dependencies page */
  depsHref?: string | undefined
  /** Link to the create page; omitted for guests */
  newHref?: string | undefined
  /** Site download page; shows the 'Need Hypernucleus?' link */
  downloadHref?: string | undefined
}

/** Title, launcher link and filters above the games grid. */
export default function LibraryHeader({
  newHref,
  downloadHref,
  depsHref,
  ...f
}: Props) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          Hypernucleus
        </Typography>
        {depsHref && (
          <Button
            component={Link}
            href={depsHref}
            startIcon={<ExtensionOutlined />}
            data-testid="deps-link"
          >
            Dependencies
          </Button>
        )}
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
        Games you can download and play with the Hypernucleus launcher.
      </Typography>
      {downloadHref && <GetLauncherLink href={downloadHref} />}
      <LibraryFilters {...f} />
    </Box>
  )
}
