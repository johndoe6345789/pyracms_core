'use client'

import { Box, Paper, Typography, List } from
  '@mui/material'
import { SearchResultItem } from
  './SearchResultItem'

export type {
  ForumSearchResult,
} from './useForumSearch'
import type { ForumSearchResult } from
  './useForumSearch'

interface SearchResultsProps {
  results: ForumSearchResult[]
  query: string
  onResultClick?: (
    result: ForumSearchResult
  ) => void
}

export function SearchResults({
  results, query, onResultClick,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Paper variant="outlined"
        sx={{ borderColor: 'divider' }}>
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No results found.
          </Typography>
        </Box>
      </Paper>
    )
  }
  return (
    <Paper variant="outlined"
      sx={{ borderColor: 'divider' }}>
      <List disablePadding>
        {results.map((result, idx) => (
          <SearchResultItem
            key={result.id}
            result={result}
            query={query}
            showDivider={
              idx < results.length - 1}
            onClick={onResultClick} />
        ))}
      </List>
    </Paper>
  )
}
