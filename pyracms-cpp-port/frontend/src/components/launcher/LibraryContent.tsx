'use client'

import type { useGameLibrary } from '@/hooks/useGameLibrary'
import type { useGameDetail } from '@/hooks/useGameDetail'
import BrowseGrid from './BrowseGrid'
import GameDetailView from './GameDetailView'

interface Props {
  slug: string
  lib: ReturnType<typeof useGameLibrary>
  detail: ReturnType<typeof useGameDetail>
  onSelect: (name: string) => void
  onBack: () => void
}

/** Games grid, or the selected game's page. */
export default function LibraryContent({
  slug,
  lib,
  detail,
  onSelect,
  onBack,
}: Props) {
  if (!detail) return <BrowseGrid games={lib.visible} onSelect={onSelect} />
  return (
    <GameDetailView
      slug={slug}
      detail={detail}
      installedVersion={lib.installed[detail.name]}
      isFav={!!lib.favs[detail.name]}
      onToggleFav={() => lib.toggleFav(detail.name)}
      onInstalled={(v) => lib.markInstalled(detail.name, v)}
      onUninstall={() => lib.unmark(detail.name)}
      onBack={onBack}
    />
  )
}
