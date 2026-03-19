import { Grid } from '@mui/material'
import GameDepCard from './GameDepCard'
import type { GameDepItem } from '@/hooks/useGameDepList'

interface GameDepGridProps {
  items: GameDepItem[]
  hrefPrefix: string
  hoverColor?: string
}

export default function GameDepGrid({
  items,
  hrefPrefix,
  hoverColor,
}: GameDepGridProps) {
  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.name}>
          <GameDepCard
            item={item}
            href={`${hrefPrefix}/${item.name}`}
            hoverColor={hoverColor}
          />
        </Grid>
      ))}
    </Grid>
  )
}
