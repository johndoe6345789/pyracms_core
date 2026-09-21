import { Box, Card, CardActionArea, Chip, Typography } from '@mui/material'
import type { GameDepItem } from '@/hooks/useGameDepList'
import GameArt from './GameArt'

interface Props {
  games: GameDepItem[]
  onSelect: (name: string) => void
}

/** Responsive grid of game cards: art, title, blurb, tags and views. */
export default function BrowseGrid({ games, onSelect }: Props) {
  return (
    <Box
      data-testid="browse-grid"
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      }}
    >
      {games.map((g) => (
        <Card key={g.name} variant="outlined">
          <CardActionArea
            onClick={() => onSelect(g.name)}
            sx={{ height: '100%', display: 'block' }}
          >
            <GameArt name={g.name} label={g.displayName} height={140} />
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" component="h2" noWrap>
                {g.displayName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  minHeight: 40,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {g.description}
              </Typography>
              <Box
                sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}
              >
                {g.tags.slice(0, 3).map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {g.views.toLocaleString()} views
              </Typography>
            </Box>
          </CardActionArea>
        </Card>
      ))}
      {games.length === 0 && (
        <Typography color="text.secondary">No games match.</Typography>
      )}
    </Box>
  )
}
