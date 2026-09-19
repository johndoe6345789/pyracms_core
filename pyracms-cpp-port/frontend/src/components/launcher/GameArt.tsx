import { Box } from '@mui/material'
import { gradientFor, initialOf } from '@/lib/launcher'

interface GameArtProps {
  name: string
  label: string
  image?: string | undefined
  height: number | string
  size?: number
}

/** Cover/banner: screenshot when available, else gradient + initial. */
export default function GameArt({
  name,
  label,
  image,
  height,
  size = 56,
}: GameArtProps) {
  return (
    <Box
      data-testid="game-art"
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.85)',
        fontSize: size,
        fontWeight: 700,
        borderRadius: 1,
        background: image ? `center / cover url(${image})` : gradientFor(name),
      }}
    >
      {image ? null : initialOf(label)}
    </Box>
  )
}
