import { Box, ButtonBase, Typography } from '@mui/material'
import { FONTS } from './themeConfig'

/** The fonts as a list, each drawn in its own typeface. */
export default function FontPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (font: string) => void
}) {
  return (
    <Box
      role="radiogroup"
      aria-label="Font family"
      sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}
    >
      {FONTS.map((f) => (
        <ButtonBase
          key={f}
          role="radio"
          aria-checked={f === value}
          onClick={() => onChange(f)}
          data-testid={`font-${f.split(',')[0]}`}
          sx={{
            p: 1.25,
            borderRadius: 1,
            border: 2,
            borderColor: f === value ? 'primary.main' : 'divider',
            justifyContent: 'flex-start',
            fontFamily: f,
            textAlign: 'left',
          }}
        >
          <Typography sx={{ fontFamily: f }}>
            <b>Aa</b> {f.split(',')[0]}
          </Typography>
        </ButtonBase>
      ))}
    </Box>
  )
}
