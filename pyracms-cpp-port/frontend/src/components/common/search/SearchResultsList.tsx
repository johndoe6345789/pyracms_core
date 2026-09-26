'use client'

import { Box, List, ListItemButton, ListItemText } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import type { Suggestion } from '@/lib/search/types'
import SearchResultRow from './SearchResultRow'

interface Props {
  results: Suggestion[]
  query: string
  /** index of the keyboard-selected row, -1 for none */
  active: number
  loading: boolean
  onSelect: (r: Suggestion) => void
  onSearchPage: () => void
}

/** Suggestions, always ending in "search everything for ...". */
export default function SearchResultsList(p: Props) {
  if (p.query.trim().length < 2) return null
  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
      <List disablePadding sx={{ maxHeight: 380, overflow: 'auto' }}>
        {p.results.map((r, i) => (
          <SearchResultRow
            key={`${r.url}:${i}`}
            r={r}
            index={i}
            active={p.active === i}
            onSelect={p.onSelect}
          />
        ))}
      </List>
      <ListItemButton
        divider={false}
        selected={p.active === -1 && p.results.length === 0}
        onClick={p.onSearchPage}
        data-testid="search-all"
        sx={{ borderTop: p.results.length ? 1 : 0, borderColor: 'divider' }}
      >
        <SearchOutlined fontSize="small" sx={{ mr: 1.5 }} />
        <ListItemText
          primary={`Search everything for "${p.query.trim()}"`}
          secondary={
            !p.loading && p.results.length === 0
              ? 'No quick matches - the full search looks deeper'
              : undefined
          }
          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
        />
      </ListItemButton>
    </Box>
  )
}
