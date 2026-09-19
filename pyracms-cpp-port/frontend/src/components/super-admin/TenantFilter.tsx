'use client'

import { TextField, InputAdornment } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function TenantFilter({ value, onChange }: Props) {
  return (
    <TextField
      size="small"
      placeholder="Filter by name…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ 'aria-label': 'Filter tenants' }}
      data-testid="tenant-filter-input"
      sx={{ mb: 1, width: 320 }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
