'use client'

import { Box, TextField, InputAdornment, Button } from '@mui/material'
import { SearchOutlined, FilterListOutlined } from '@mui/icons-material'

interface Props {
  query: string
  onQuery: (v: string) => void
  onSearch: () => void
  onToggleFilters: () => void
}

export function ForumSearchInput(p: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <TextField
        placeholder="Search forum posts..."
        value={p.query}
        onChange={(e) => p.onQuery(e.target.value)}
        size="small" fullWidth
        onKeyDown={(e) => e.key === 'Enter' && p.onSearch()}
        data-testid="forum-search-input"
        InputProps={{ startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>
        ) }} />
      <Button variant="outlined" startIcon={<FilterListOutlined />}
        onClick={p.onToggleFilters} size="small"
        data-testid="forum-search-filters-btn">
        Filters
      </Button>
      <Button variant="contained" onClick={p.onSearch} size="small"
        data-testid="forum-search-submit">
        Search
      </Button>
    </Box>
  )
}
