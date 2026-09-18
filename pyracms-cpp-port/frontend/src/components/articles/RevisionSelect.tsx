'use client'

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'

export interface DiffRevision {
  id: string
  label: string
  date: string
  author: string
  content: string
}

interface RevisionSelectProps {
  label: string
  value: string
  revisions: DiffRevision[]
  onChange: (id: string) => void
}

export function RevisionSelect({
  label,
  value,
  revisions,
  onChange,
}: RevisionSelectProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        {revisions.map((rev) => (
          <MenuItem key={rev.id} value={rev.id}>
            {rev.label} - {rev.author} ({rev.date})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
