'use client'

import {
  Box, FormControl, InputLabel, Select, MenuItem, TextField,
  InputAdornment, Chip,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import type { useSnippets } from '@/hooks/useSnippets'

type Props = { s: ReturnType<typeof useSnippets> }

export function SnippetFilters({ s }: Props) {
  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search title, author or code..."
          value={s.search}
          onChange={(e) => s.setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          data-testid="snippet-search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined aria-label="Search" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={s.sortBy}
            label="Sort By"
            onChange={(e) => s.setSortBy(e.target.value)}
            data-testid="sort-select"
          >
            <MenuItem value="date">Newest</MenuItem>
            <MenuItem value="popularity">Most Runs</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}
        data-testid="language-filter"
      >
        <Chip label="All" color={s.language ? 'default' : 'primary'}
          onClick={() => s.setLanguage('')} />
        {s.languages.map((l) => (
          <Chip key={l} label={l}
            color={s.language === l ? 'primary' : 'default'}
            onClick={() => s.setLanguage(s.language === l ? '' : l)} />
        ))}
      </Box>
    </>
  )
}
