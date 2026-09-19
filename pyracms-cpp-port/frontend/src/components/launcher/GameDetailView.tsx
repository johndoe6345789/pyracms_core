import { Box, Button, IconButton, Typography } from '@mui/material'
import {
  FavoriteBorderOutlined,
  FavoriteOutlined,
  EditOutlined,
} from '@mui/icons-material'
import Link from 'next/link'
import type { GameDepDetailData } from '@/hooks/useGameDepDetail'
import GameActions from './GameActions'
import GameArt from './GameArt'
import GameInfo from './GameInfo'

interface Props {
  slug: string
  detail: GameDepDetailData
  installedVersion: string | undefined
  isFav: boolean
  onToggleFav: () => void
  onInstalled: (version: string) => void
  onUninstall: () => void
}

/** Cover, title, actions and info for the selected game. */
export default function GameDetailView(p: Props) {
  const d = p.detail
  return (
    <Box>
      <GameArt
        name={d.name}
        label={d.displayName}
        image={d.screenshots[0]?.src}
        height={220}
        size={96}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        <Typography variant="h4" component="h2" sx={{ flex: 1 }}>
          {d.displayName}
        </Typography>
        <IconButton aria-label="Toggle favourite" onClick={p.onToggleFav}>
          {p.isFav ? (
            <FavoriteOutlined color="error" />
          ) : (
            <FavoriteBorderOutlined />
          )}
        </IconButton>
        <Button
          component={Link}
          startIcon={<EditOutlined />}
          href={`/site/${p.slug}/games/${d.name}/edit`}
        >
          Edit
        </Button>
      </Box>
      <GameActions
        key={d.name}
        slug={p.slug}
        name={d.name}
        revisions={d.revisions}
        binaries={d.binaries}
        installedVersion={p.installedVersion}
        onInstalled={p.onInstalled}
        onUninstall={p.onUninstall}
      />
      <GameInfo detail={d} slug={p.slug} />
    </Box>
  )
}
