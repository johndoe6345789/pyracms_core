import { Box, Paper, Typography } from '@mui/material'
import ColorPickerField from './ColorPickerField'
import ContrastBadge from './ContrastBadge'
import FontPicker from './FontPicker'
import ThemeLayoutControls from './ThemeLayoutControls'
import type { ThemeConfig } from './themeConfig'

interface Props {
  theme: ThemeConfig
  update: (k: keyof ThemeConfig, v: string | number) => void
}

const COLORS: [string, keyof ThemeConfig, string][] = [
  ['Primary Color', 'primaryColor', 'Buttons, links and highlights'],
  ['Secondary Color', 'secondaryColor', 'Accents and secondary buttons'],
  ['Background Color', 'backgroundColor', 'The page behind everything'],
  ['Text Color', 'textColor', 'Body text and headings'],
]

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
      {title}
    </Typography>
    {children}
  </Paper>
)

export default function ThemeControls({ theme, update }: Props) {
  return (
    <>
      <Section title="Colours">
        {COLORS.map(([label, key, help]) => (
          <ColorPickerField
            key={key}
            label={label}
            help={help}
            color={theme[key] as string}
            onChange={(c) => update(key, c)}
          />
        ))}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <ContrastBadge
            label="Text on background"
            fg={theme.textColor}
            bg={theme.backgroundColor}
          />
          <ContrastBadge
            label="Links on background"
            fg={theme.primaryColor}
            bg={theme.backgroundColor}
          />
        </Box>
      </Section>
      <Section title="Typography">
        <FontPicker
          value={theme.fontFamily}
          onChange={(f) => update('fontFamily', f)}
        />
      </Section>
      <Section title="Shape &amp; spacing">
        <ThemeLayoutControls theme={theme} update={update} />
      </Section>
    </>
  )
}
