'use client'

import {
  Box,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  SearchOutlined,
} from '@mui/icons-material'

interface ArticleSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function ArticleSearchBar(
  { value, onChange }: ArticleSearchBarProps
) {
  return (
    <Box sx={{ mb: 4 }}>
      <TextField
        fullWidth
        placeholder="Search articles..."
        variant="outlined"
        size="small"
        value={value}
        onChange={
          (e) => onChange(e.target.value)
        }
        data-testid="article-search-input"
        aria-label="Search articles"
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
            >
              <SearchOutlined
                sx={{
                  color: 'text.secondary',
                }}
                aria-hidden="true"
              />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  )
}
