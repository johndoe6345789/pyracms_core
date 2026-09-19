'use client'

import { Typography } from '@mui/material'
import type { useGameLibrary } from '@/hooks/useGameLibrary'
import type { useGameDetail } from '@/hooks/useGameDetail'
import type { LibraryView } from './LibraryHeader'
import BrowseGrid from './BrowseGrid'
import GameDetailView from './GameDetailView'

interface Props {
  slug: string
  lib: ReturnType<typeof useGameLibrary>
  detail: ReturnType<typeof useGameDetail>
  view: LibraryView
  onSelect: (name: string) => void
}

/** Browse grid, selected game view or empty hint. */
export default function LibraryContent({
  slug,
  lib,
  detail,
  view,
  onSelect,
}: Props) {
  if (view === 'browse')
    return <BrowseGrid games={lib.visible} onSelect={onSelect} />
  if (!detail)
    return (
      <Typography color="text.secondary">
        Select a game from the library.
      </Typography>
    )
  return (
    <GameDetailView
      slug={slug}
      detail={detail}
      installedVersion={lib.installed[detail.name]}
      isFav={!!lib.favs[detail.name]}
      onToggleFav={() => lib.toggleFav(detail.name)}
      onInstalled={(v) => lib.markInstalled(detail.name, v)}
      onUninstall={() => lib.unmark(detail.name)}
    />
  )
}
