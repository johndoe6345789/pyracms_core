import {
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Box,
} from '@mui/material'
import type { SiteSettings } from '@/lib/siteSettings'
import type { FieldDef } from './siteSettingDefs'

interface Props {
  def: FieldDef
  value: SiteSettings[keyof SiteSettings]
  problem?: string | undefined
  onChange: (v: string | boolean) => void
}

const MODES: [string, string][] = [
  ['system', "Follow the visitor's device"],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

/** One guided setting: a typed control with its explanation. */
export default function SettingField({ def, value, problem, onChange }: Props) {
  const id = `setting-${def.key}`
  if (def.kind === 'bool')
    return (
      <Box data-testid={id}>
        <FormControlLabel
          label={def.label}
          control={
            <Switch
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
            />
          }
        />
        <Typography variant="body2" color="text.secondary">
          {def.help}
        </Typography>
      </Box>
    )
  const multi = def.kind === 'multiline'
  return (
    <TextField
      fullWidth
      size="small"
      label={def.label}
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      error={Boolean(problem)}
      helperText={problem || def.help}
      multiline={multi}
      minRows={multi ? 2 : 1}
      select={def.kind === 'theme'}
      type={def.kind === 'email' ? 'email' : 'text'}
      inputProps={{ 'data-testid': id }}
    >
      {def.kind === 'theme' &&
        MODES.map(([v, label]) => (
          <MenuItem key={v} value={v}>
            {label}
          </MenuItem>
        ))}
    </TextField>
  )
}
