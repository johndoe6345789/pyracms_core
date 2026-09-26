import { Alert, Box, Typography } from '@mui/material'
import StyleCard from './StyleCard'
import { THEME_PRESETS, sameTheme } from './presets'
import type { ThemeConfig } from './themeConfig'
import { PRESET_GRID as grid } from './presetGrid'

interface Props {
  theme: ThemeConfig
  saved: ThemeConfig
  previous: ThemeConfig | null
  /** something differs from what is saved (in either mode) */
  unsaved: boolean
  onPick: (t: ThemeConfig) => void
}

/** Your saved style (always one click back), the one before it, and the
 * ready-made looks. Picking one only previews it until you save. */
export default function StylePresets({
  theme,
  saved,
  previous,
  unsaved,
  onPick,
}: Props) {
  const changed = !sameTheme(theme, saved)
  const anyChange = changed || unsaved
  return (
    <Box sx={{ mb: 4 }} data-testid="style-presets">
      <Typography variant="h6" component="h2" gutterBottom>
        Preset styles
      </Typography>
      {anyChange && (
        <Alert severity="info" sx={{ mb: 2 }} data-testid="style-unsaved">
          You are previewing a style that is not saved yet. Save to keep it, or
          go back to your current style below.
        </Alert>
      )}
      <Box sx={{ ...grid, mb: 2 }}>
        <StyleCard
          name="Your current style"
          tagline="What visitors see right now"
          theme={saved}
          selected={!changed}
          onPick={() => onPick(saved)}
          {...(changed
            ? {
                action: {
                  label: 'Go back to this',
                  onClick: () => onPick(saved),
                },
              }
            : {})}
        />
        {previous && !sameTheme(previous, saved) && (
          <StyleCard
            name="Your previous style"
            tagline="The look you had before your last save"
            theme={previous}
            selected={sameTheme(theme, previous)}
            onPick={() => onPick(previous)}
          />
        )}
      </Box>
      <Box sx={grid}>
        {THEME_PRESETS.map((p) => (
          <StyleCard
            key={p.name}
            name={p.name}
            tagline={p.tagline}
            theme={p.theme}
            selected={sameTheme(theme, p.theme)}
            onPick={() => onPick(p.theme)}
          />
        ))}
      </Box>
    </Box>
  )
}
