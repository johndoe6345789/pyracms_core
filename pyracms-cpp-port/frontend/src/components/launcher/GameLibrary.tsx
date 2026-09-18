'use client'

import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Drawer, IconButton, ToggleButton,
  ToggleButtonGroup, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import {
  MenuOutlined, FavoriteBorderOutlined, FavoriteOutlined, EditOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import { useGameLibrary, useGameDetail } from '@/hooks/useGameLibrary'
import LibrarySidebar from './LibrarySidebar'
import BrowseGrid from './BrowseGrid'
import GameActions from './GameActions'
import GameArt from './GameArt'
import GameInfo from './GameInfo'

interface Props { slug: string; initialName?: string | undefined }

export default function GameLibrary({ slug, initialName }: Props) {
  const lib = useGameLibrary()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const [view, setView] = useState<'library' | 'browse'>(
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
    <Box data-testid="game-library" sx={{
      display: 'flex', minHeight: '70vh', bgcolor: '#171d25',
      color: '#c7d5e0', borderRadius: 1, overflow: 'hidden',
    }}>
      {!mobile && (
        <Box sx={{ width: 280, flexShrink: 0, bgcolor: '#1b2838',
          borderRight: '1px solid #2a475e' }}>{sidebar}</Box>
      )}
      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 300, height: '100%' }}>{sidebar}</Box>
      </Drawer>
      <Box sx={{ flex: 1, p: { xs: 1.5, md: 3 }, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {mobile && (
            <IconButton aria-label="Open library"
              onClick={() => setDrawer(true)}><MenuOutlined /></IconButton>
          )}
          <Typography variant="h5" component="h1" sx={{ flex: 1 }}>
            Games
          </Typography>
          <ToggleButtonGroup exclusive size="small" value={view}
            onChange={(_, v) => v && setView(v)}>
            <ToggleButton value="library">Library</ToggleButton>
            <ToggleButton value="browse">Browse</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {lib.sample && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No games are published yet. These are sample entries for
            layout only, not real downloads.
          </Alert>
        )}
        {lib.loading && <Typography>Loading...</Typography>}
        {view === 'browse' ? (
          <BrowseGrid games={lib.visible} onSelect={select} />
        ) : detail ? (
          <Box>
            <GameArt name={detail.name} label={detail.displayName}
              image={detail.screenshots[0]?.src} height={220} size={96} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,
              mt: 2, mb: 2 }}>
              <Typography variant="h4" component="h2" sx={{ flex: 1 }}>
                {detail.displayName}
              </Typography>
              <IconButton aria-label="Toggle favourite"
                onClick={() => lib.toggleFav(detail.name)}>
                {lib.favs[detail.name]
                  ? <FavoriteOutlined color="error" />
                  : <FavoriteBorderOutlined />}
              </IconButton>
              <Button component={Link} startIcon={<EditOutlined />}
                href={`/site/${slug}/games/${detail.name}/edit`}>
                Edit
              </Button>
            </Box>
            <GameActions key={detail.name} slug={slug} name={detail.name}
              revisions={detail.revisions} binaries={detail.binaries}
              installedVersion={lib.installed[detail.name]}
              onInstalled={(v) => lib.markInstalled(detail.name, v)}
              onUninstall={() => lib.unmark(detail.name)} />
            <GameInfo detail={detail} slug={slug} />
          </Box>
        ) : (
          <Typography color="text.secondary">
            Select a game from the library.
          </Typography>
        )}
      </Box>
    </Box>
  )
}
