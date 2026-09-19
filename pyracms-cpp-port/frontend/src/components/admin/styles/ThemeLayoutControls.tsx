import { Typography, Divider, Slider } from '@mui/material'
import type { ThemeConfig } from './themeConfig'

interface Props {
  theme: ThemeConfig
  update: (k: keyof ThemeConfig, v: string | number) => void
}

export default function ThemeLayoutControls({ theme, update }: Props) {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Layout
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Border Radius: {theme.borderRadius}px
      </Typography>
      <Slider
        value={theme.borderRadius}
        onChange={(_, v) => update('borderRadius', v as number)}
        min={0}
        max={24}
        step={1}
        sx={{ mb: 2 }}
      />
      <Typography variant="subtitle2" gutterBottom>
        Spacing: {theme.spacing}px
      </Typography>
      <Slider
        value={theme.spacing}
        onChange={(_, v) => update('spacing', v as number)}
        min={2}
        max={16}
        step={1}
      />
    </>
  )
}
