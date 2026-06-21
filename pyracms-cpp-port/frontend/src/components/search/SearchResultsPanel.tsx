'use client'

import {
  Box,
  List,
  Pagination,
  Paper,
  Typography,
} from '@mui/material'
import AnimatedList from '@/components/common/AnimatedList'
import {
  SEARCH_ITEMS_PER_PAGE,
  type SearchResult,
} from '@/hooks/useSearchPage'
import { SearchResultRow } from './SearchResultRow'

interface SearchResultsPanelProps {
  loading: boolean
  page: number
  query: string
  results: SearchResult[]
  setPage: (page: number) => void
  totalCount: number
}

export function SearchResultsPanel({
  loading,
  page,
  query,
  results,
  setPage,
  totalCount,
}: SearchResultsPanelProps) {
  const totalPages = Math.ceil(totalCount / SEARCH_ITEMS_PER_PAGE)

  if (loading) {
    return (
      <Typography color="text.secondary" data-testid="search-loading">
        Searching...
      </Typography>
    )
  }

  if (results.length === 0) {
    return (
      <Paper variant="outlined" data-testid="search-empty" sx={{ p: 4 }}>
        <Typography color="text.secondary">
          {query ? `No results for "${query}"` : 'Enter a search query.'}
        </Typography>
      </Paper>
    )
  }

  return (
    <>
      <List disablePadding data-testid="search-results">
        <AnimatedList>
          {results.map((result, index) => (
            <SearchResultRow
              key={`${result.type}-${result.id}`}
              index={index}
              query={query}
              result={result}
              last={index === results.length - 1}
            />
          ))}
        </AnimatedList>
      </List>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            color="primary"
            data-testid="search-pagination"
          />
        </Box>
      )}
    </>
  )
}
