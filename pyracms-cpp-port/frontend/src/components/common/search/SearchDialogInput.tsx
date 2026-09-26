'use client'

import type { Ref } from 'react'
import { TextField, InputAdornment, Chip } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'

interface Props {
  inputRef: Ref<HTMLInputElement>
  query: string
  onQueryChange: (q: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export default function SearchDialogInput({
  inputRef,
  query,
  onQueryChange,
  onKeyDown,
}: Props) {
  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      placeholder="Search this site..."
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={onKeyDown}
      data-testid="search-dialog-input"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>
        ),
        ...(query
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <Chip
                    label="Enter to search all"
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.7rem' }}
                  />
                </InputAdornment>
              ),
            }
          : {}),
      }}
      sx={{
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiInputBase-root': { py: 1.5 },
      }}
    />
  )
}
