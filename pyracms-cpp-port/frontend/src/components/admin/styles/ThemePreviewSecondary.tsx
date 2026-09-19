import {
  Typography, Box, Button, Card, CardContent,
} from '@mui/material'
import type { ThemeConfig } from './themeConfig'

interface Props {
  theme: ThemeConfig
  card: Record<string, unknown>
}

export default function ThemePreviewSecondary({
  theme, card,
}: Props) {
  const r = `${theme.borderRadius}px`
  const f = theme.fontFamily
  const outline = (color: string) => ({
    borderColor: color, color, borderRadius: r,
  })
  return (
    <Card sx={card}>
      <CardContent>
        <Typography
          variant="h6"
          sx={{ color: theme.secondaryColor, fontFamily: f, mb: 1 }}
        >
          Secondary Element
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontFamily: f, color: theme.textColor }}
        >
          This element uses the secondary color for its heading.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            sx={outline(theme.primaryColor)}
          >
            Action
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={outline(theme.secondaryColor)}
          >
            Secondary
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
