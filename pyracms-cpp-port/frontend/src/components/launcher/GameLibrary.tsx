'use client'

import { useEffect, useState } from 'react'
import {
  Box, Drawer, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import { useGameLibrary } from '@/hooks/useGameLibrary'
import { useGameDetail } from '@/hooks/useGameDetail'
import { useSiteSession } from '@/hooks/useSiteSession'
import LibrarySidebar from './LibrarySidebar'
import LibraryHeader, { type LibraryView } from './LibraryHeader'
import SampleNotice from './SampleNotice'
import BrowseGrid from './BrowseGrid'
import GameDetailView from './GameDetailView'

interface Props { slug: string; initialName?: string | undefined }

const shellSx = {
  display: 'flex', minHeight: '70vh', bgcolor: '#171d25',
  color: '#c7d5e0', borderRadius: 1, overflow: 'hidden',
} as const

export default function GameLibrary({ slug, initialName }: Props) {
  const lib = useGameLibrary()
  const signedIn = useSiteSession(slug)
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const [view, setView] = useState<LibraryView>(
    initialName ? 'library' : 'browse')
  const [selected, setSelected] = useState<string | null>(
    initialName ?? null)
  const [drawer, setDrawer] = useState(false)
  const detail = useGameDetail(selected, lib.sample)

  useEffect(() => {
    if (!selected && view === 'library' && lib.visible[0])
      setSelected(lib.visible[0].name)
  }, [selected, view, lib.visible])

  const select = (name: string) => {
    setSelected(name); setView('library'); setDrawer(false)
  }
  const sidebar = (
    <LibrarySidebar games={lib.visible} selected={selected}
      onSelect={select} search={lib.search} onSearch={lib.setSearch}
      filter={lib.filter} onFilter={lib.setFilter} tags={lib.tags}
      tag={lib.tag} onTag={lib.setTag} installed={lib.installed}
      favs={lib.favs} />
  )

  return (
    <Box data-testid="game-library" sx={shellSx}>
      {!mobile && (
        <Box sx={{ width: 280, flexShrink: 0, bgcolor: '#1b2838',
          borderRight: '1px solid #2a475e' }}>{sidebar}</Box>
      )}
      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 300, height: '100%' }}>{sidebar}</Box>
      </Drawer>
      <Box sx={{ flex: 1, p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
        <LibraryHeader mobile={mobile} view={view} onView={setView}
          onOpenDrawer={() => setDrawer(true)}
          newHref={signedIn ? `/site/${slug}/games/new` : undefined} />
        {lib.sample && <SampleNotice />}
        {lib.loading && <Typography>Loading...</Typography>}
        {view === 'browse' ? (
          <BrowseGrid games={lib.visible} onSelect={select} />
        ) : detail ? (
          <GameDetailView slug={slug} detail={detail}
            installedVersion={lib.installed[detail.name]}
            isFav={!!lib.favs[detail.name]}
            onToggleFav={() => lib.toggleFav(detail.name)}
            onInstalled={(v) => lib.markInstalled(detail.name, v)}
            onUninstall={() => lib.unmark(detail.name)} />
        ) : (
          <Typography color="text.secondary">
            Select a game from the library.
          </Typography>
        )}
      </Box>
    </Box>
  )
}
