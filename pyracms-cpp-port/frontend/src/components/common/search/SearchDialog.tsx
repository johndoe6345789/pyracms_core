'use client'

import { useRef, useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import type { Suggestion } from '@/lib/search/types'
import SearchDialogInput from './SearchDialogInput'
import SearchResultsList from './SearchResultsList'

interface Props {
  open: boolean
  query: string
  results: Suggestion[]
  loading?: boolean
  onClose: () => void
  onQueryChange: (q: string) => void
  onSelect: (r: Suggestion) => void
  onSearchPage: () => void
}

/** Quick search: type, arrow through suggestions, Enter to open or search. */
export default function SearchDialog(p: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(-1)
  useEffect(() => {
    if (p.open) setTimeout(() => ref.current?.focus(), 100)
  }, [p.open])
  useEffect(() => setActive(-1), [p.results])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = p.results.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, last))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter' && p.query.trim()) {
      const pick = p.results[active]
      if (pick) p.onSelect(pick)
      else p.onSearchPage()
    }
  }

  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiDialog-paper': { mt: '10vh', borderRadius: 2 } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <SearchDialogInput
          inputRef={ref}
          query={p.query}
          onQueryChange={p.onQueryChange}
          onKeyDown={onKeyDown}
        />
        <SearchResultsList
          results={p.results}
          query={p.query}
          active={active}
          loading={p.loading ?? false}
          onSelect={p.onSelect}
          onSearchPage={p.onSearchPage}
        />
      </DialogContent>
    </Dialog>
  )
}
