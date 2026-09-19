import {
  Typography,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import ColorPickerField from './ColorPickerField'
import ThemeLayoutControls from './ThemeLayoutControls'
import { FONTS, type ThemeConfig } from './themeConfig'

interface Props {
  theme: ThemeConfig
  update: (k: keyof ThemeConfig, v: string | number) => void
}

const COLORS: [string, keyof ThemeConfig][] = [
  ['Primary Color', 'primaryColor'],
  ['Secondary Color', 'secondaryColor'],
  ['Background Color', 'backgroundColor'],
  ['Text Color', 'textColor'],
]

export default function ThemeControls({ theme, update }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom>
        Colors
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {COLORS.map(([label, key]) => (
        <ColorPickerField
          key={key}
          label={label}
          color={theme[key] as string}
          onChange={(c) => update(key, c)}
        />
      ))}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Typography
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Font Family</InputLabel>
        <Select
          value={theme.fontFamily}
          label="Font Family"
          onChange={(e) => update('fontFamily', e.target.value)}
        >
          {FONTS.map((f) => (
            <MenuItem key={f} value={f} sx={{ fontFamily: f }}>
              {f.split(',')[0]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ThemeLayoutControls theme={theme} update={update} />
    </Paper>
  )
}
