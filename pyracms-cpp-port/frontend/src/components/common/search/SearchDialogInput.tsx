'use client'

import type { Ref } from 'react'
import { TextField, InputAdornment, Chip } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'

interface Props {
  inputRef: Ref<HTMLInputElement>
  query: string
  onQueryChange: (q: string) => void
  onSearchPage: () => void
}

export default function SearchDialogInput({
  inputRef,
  query,
  onQueryChange,
  onSearchPage,
}: Props) {
  return (
    <TextField
      inputRef={inputRef}
      fullWidth
      placeholder="Search articles, posts..."
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && query) onSearchPage()
      }}
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
