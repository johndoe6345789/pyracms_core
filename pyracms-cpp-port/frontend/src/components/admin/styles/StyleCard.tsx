import { Box, Button, Card, CardActionArea, Typography } from '@mui/material'
import type { ThemeConfig } from './themeConfig'

interface Props {
  name: string
  tagline: string
  theme: ThemeConfig
  selected: boolean
  onPick: () => void
  action?: { label: string; onClick: () => void }
}

/** A preview of a look: its four colours, its font and its name. */
export default function StyleCard(p: Props) {
  const t = p.theme
  return (
    <Card
      variant="outlined"
      data-testid={`style-card-${p.name}`}
      sx={{
        borderColor: p.selected ? 'primary.main' : 'divider',
        borderWidth: p.selected ? 2 : 1,
      }}
    >
      <CardActionArea onClick={p.onPick} aria-label={`Use ${p.name}`}>
        <Box sx={{ display: 'flex', height: 36 }} aria-hidden>
          {[
            t.primaryColor,
            t.secondaryColor,
            t.backgroundColor,
            t.textColor,
          ].map((c) => (
            <Box key={c} sx={{ flex: 1, bgcolor: c }} />
          ))}
        </Box>
        <Box sx={{ p: 1.5, bgcolor: t.backgroundColor, color: t.textColor }}>
          <Typography
            fontWeight={700}
            sx={{ fontFamily: t.fontFamily, color: t.primaryColor }}
          >
            {p.name}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: t.fontFamily }}>
            {p.tagline}
          </Typography>
        </Box>
      </CardActionArea>
      {p.action && (
        <Button size="small" fullWidth onClick={p.action.onClick}>
          {p.action.label}
        </Button>
      )}
    </Card>
  )
}
