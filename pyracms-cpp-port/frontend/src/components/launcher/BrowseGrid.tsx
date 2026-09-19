import { Box, Card, CardActionArea, Typography } from '@mui/material'
import type { GameDepItem } from '@/hooks/useGameDepList'
import GameArt from './GameArt'

interface Props {
  games: GameDepItem[]
  onSelect: (name: string) => void
}

export default function BrowseGrid({ games, onSelect }: Props) {
  return (
    <Box
      data-testid="browse-grid"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      }}
    >
      {games.map((g) => (
        <Card key={g.name} variant="outlined">
          <CardActionArea onClick={() => onSelect(g.name)} sx={{ p: 1 }}>
            <GameArt name={g.name} label={g.displayName} height={110} />
            <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
              {g.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {g.views.toLocaleString()} views
            </Typography>
          </CardActionArea>
        </Card>
      ))}
      {games.length === 0 && (
        <Typography color="text.secondary">No games match.</Typography>
      )}
    </Box>
  )
}
