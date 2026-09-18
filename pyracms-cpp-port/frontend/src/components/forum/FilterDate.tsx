'use client'

import { TextField } from '@mui/material'

interface Props {
  label: string
  value: string
  testId: string
  onChange: (v: string) => void
}

export function FilterDate({ label, value, testId, onChange }: Props) {
  return (
    <TextField
      label={label}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      InputLabelProps={{ shrink: true }}
      data-testid={testId}
    />
  )
}
