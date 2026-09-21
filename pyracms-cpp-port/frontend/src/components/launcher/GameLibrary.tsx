'use client'

import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useGameLibrary } from '@/hooks/useGameLibrary'
import { useGameDetail } from '@/hooks/useGameDetail'
import { useSiteSession } from '@/hooks/useSiteSession'
import LibraryHeader from './LibraryHeader'
import LibraryContent from './LibraryContent'

interface Props {
  slug: string
  initialName?: string | undefined
}

/** Games page in the site's own theme: filter bar + grid, or one game. */
export default function GameLibrary({ slug, initialName }: Props) {
  const lib = useGameLibrary()
  const signedIn = useSiteSession(slug)
  const [selected, setSelected] = useState<string | null>(initialName ?? null)
  const detail = useGameDetail(selected)

  return (
    <Box data-testid="game-library">
      {!selected && (
        <LibraryHeader
          search={lib.search}
          onSearch={lib.setSearch}
          filter={lib.filter}
          onFilter={lib.setFilter}
          tags={lib.tags}
          tag={lib.tag}
          onTag={lib.setTag}
          newHref={signedIn ? `/site/${slug}/games/new` : undefined}
          downloadHref={`/site/${slug}/download`}
        />
      )}
      {lib.loading && <Typography>Loading...</Typography>}
      <LibraryContent
        slug={slug}
        lib={lib}
        detail={detail}
        onSelect={setSelected}
        onBack={() => setSelected(null)}
      />
    </Box>
  )
}
