'use client'

import { useRef, useEffect } from 'react'
import {
  TextField, InputAdornment, Chip,
  Dialog, DialogContent, Fade,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import type { SearchResult }
  from './SearchResultsList'
import SearchResultsList
  from './SearchResultsList'

interface Props {
  open: boolean
  query: string
  results: SearchResult[]
  onClose: () => void
  onQueryChange: (q: string) => void
  onSelect: (r: SearchResult) => void
  onSearchPage: () => void
}

export default function SearchDialog({
  open, query, results, onClose,
  onQueryChange, onSelect, onSearchPage,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) setTimeout(
      () => ref.current?.focus(), 100)
  }, [open])

  return (
    <Dialog open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      TransitionComponent={Fade}
      sx={{ '& .MuiDialog-paper': {
        mt: '10vh', borderRadius: 2 } }}>
      <DialogContent sx={{ p: 0 }}>
        <TextField inputRef={ref} fullWidth
          placeholder="Search articles, posts..."
          value={query}
          onChange={(e) =>
            onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query)
              onSearchPage()
          }}
          data-testid="search-dialog-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>),
            endAdornment: query ? (
              <InputAdornment position="end">
                <Chip
                  label="Enter to search all"
                  size="small" variant="outlined"
                  sx={{ height: 22,
                    fontSize: '0.7rem' }} />
              </InputAdornment>) : undefined,
          }}
          sx={{
            '& .MuiOutlinedInput-notchedOutline':
              { border: 'none' },
            '& .MuiInputBase-root': { py: 1.5 },
          }} />
        <SearchResultsList results={results}
          query={query} onSelect={onSelect} />
      </DialogContent>
    </Dialog>
  )
}
