'use client'

import { Box, Typography, List } from '@mui/material'
import type { SearchResult } from './searchIcons'
import SearchResultRow from './SearchResultRow'

export type { SearchResult }

interface Props {
  results: SearchResult[]
  query: string
  onSelect: (r: SearchResult) => void
}
export default function SearchResultsList({ results, query, onSelect }: Props) {
  if (results.length === 0 && query.length >= 2)
    return (
      <Box
        sx={{ p: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}
      >
        <Typography color="text.secondary">
          No results for &quot;{query}&quot;
        </Typography>
      </Box>
    )
  if (results.length === 0) return null
  const grp = results.reduce<Record<string, SearchResult[]>>((a, r) => {
    ;(a[r.type] ??= []).push(r)
    return a
  }, {})
  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        maxHeight: 400,
        overflow: 'auto',
      }}
    >
      {Object.entries(grp).map(([t, items]) => (
        <Box key={t}>
          <Typography
            variant="caption"
            sx={{
              px: 2,
              py: 0.5,
              display: 'block',
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontWeight: 600,
              bgcolor: 'background.default',
            }}
          >
            {t}s
          </Typography>
          <List disablePadding>
            {items.map((r) => (
              <SearchResultRow key={r.id} r={r} onSelect={onSelect} />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  )
}
