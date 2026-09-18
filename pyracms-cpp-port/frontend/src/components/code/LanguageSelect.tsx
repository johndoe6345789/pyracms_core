'use client'

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { LANGUAGES } from './languages'

interface Props {
  value: string
  onChange: (language: string) => void
}

export function LanguageSelect({ value, onChange }: Props) {
  return (
    <FormControl size="small" sx={{ maxWidth: 200 }}>
      <InputLabel>Language</InputLabel>
      <Select
        value={value}
        label="Language"
        onChange={(e) => onChange(e.target.value)}
        data-testid="code-editor-language"
      >
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.value} value={lang.value}>
            {lang.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
