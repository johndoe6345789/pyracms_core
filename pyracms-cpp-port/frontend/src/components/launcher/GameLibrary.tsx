'use client'

import {
  Box,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useGameLibrary } from '@/hooks/useGameLibrary'
import { useGameDetail } from '@/hooks/useGameDetail'
import { useSiteSession } from '@/hooks/useSiteSession'
import LibrarySidebar from './LibrarySidebar'
import LibraryHeader from './LibraryHeader'
import LibraryNav from './LibraryNav'
import LibraryContent from './LibraryContent'
import { useLibrarySelection } from './useLibrarySelection'
import { launcherTheme, shellSx } from './launcherTheme'

interface Props {
  slug: string
  initialName?: string | undefined
}
export default function GameLibrary({ slug, initialName }: Props) {
  const lib = useGameLibrary()
  const signedIn = useSiteSession(slug)
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const sel = useLibrarySelection(lib.visible, initialName)
  const detail = useGameDetail(sel.selected)

  const sidebar = (
    <LibrarySidebar
      games={lib.visible}
      selected={sel.selected}
      onSelect={sel.select}
      search={lib.search}
      onSearch={lib.setSearch}
      filter={lib.filter}
      onFilter={lib.setFilter}
      tags={lib.tags}
      tag={lib.tag}
      onTag={lib.setTag}
      installed={lib.installed}
      favs={lib.favs}
    />
  )
  return (
    <ThemeProvider theme={launcherTheme}>
      <Box data-testid="game-library" sx={shellSx}>
        <LibraryNav
          mobile={mobile}
          drawer={sel.drawer}
          onCloseDrawer={() => sel.setDrawer(false)}
          sidebar={sidebar}
        />
        <Box sx={{ flex: 1, p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
          <LibraryHeader
            mobile={mobile}
            view={sel.view}
            onView={sel.setView}
            onOpenDrawer={() => sel.setDrawer(true)}
            newHref={signedIn ? `/site/${slug}/games/new` : undefined}
            downloadHref={`/site/${slug}/download`}
          />
          {lib.loading && <Typography>Loading...</Typography>}
          <LibraryContent
            slug={slug}
            lib={lib}
            detail={detail}
            view={sel.view}
            onSelect={sel.select}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}
