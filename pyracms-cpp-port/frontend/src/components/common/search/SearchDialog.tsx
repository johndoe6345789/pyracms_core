'use client'

import { useRef, useEffect } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import SearchDialogInput from './SearchDialogInput'
import type { SearchResult } from './SearchResultsList'
import SearchResultsList from './SearchResultsList'

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
  open,
  query,
  results,
  onClose,
  onQueryChange,
  onSelect,
  onSearchPage,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 100)
  }, [open])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          mt: '10vh',
          borderRadius: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <SearchDialogInput
          inputRef={ref}
          query={query}
          onQueryChange={onQueryChange}
          onSearchPage={onSearchPage}
        />
        <SearchResultsList
          results={results}
          query={query}
          onSelect={onSelect}
        />
      </DialogContent>
    </Dialog>
  )
}
