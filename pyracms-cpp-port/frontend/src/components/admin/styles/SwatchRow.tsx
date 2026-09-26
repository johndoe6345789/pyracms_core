import { Box, ButtonBase } from '@mui/material'
import { SWATCHES } from './colorSwatches'

/** Ready colours to start from. */
export default function SwatchRow({ onPick }: { onPick: (c: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {SWATCHES.map((c) => (
        <ButtonBase
          key={c}
          aria-label={`Use ${c}`}
          onClick={() => onPick(c)}
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: c,
            border: 1,
            borderColor: 'divider',
          }}
        />
      ))}
    </Box>
  )
}
