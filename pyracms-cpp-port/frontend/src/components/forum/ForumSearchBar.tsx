'use client'

import { useState } from 'react'
import { Box } from '@mui/material'
import { SearchFilters } from './SearchFilters'
import { SearchResults } from './SearchResults'
import { ForumSearchInput } from './ForumSearchInput'
import { useForumSearch, type ForumSearchResult } from './useForumSearch'

interface ForumSearchBarProps {
  forums?: string[]
  tenantId?: number | null
  onResultClick?: ((result: ForumSearchResult) => void) | undefined
}

export type { ForumSearchResult }

const DEFAULT_FORUMS = [
  'General Discussion',
  'Technology',
  'Help & Support',
  'Off Topic',
]

export function ForumSearchBar({
  forums,
  tenantId,
  onResultClick,
}: ForumSearchBarProps) {
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState('')
  const [forum, setForum] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { results, hasSearched, search } = useForumSearch(tenantId)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ForumSearchInput
        query={query}
        onQuery={setQuery}
        onSearch={() => search(query, author, forum)}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />
      {showFilters && (
        <SearchFilters
          author={author}
          onAuthorChange={setAuthor}
          forum={forum}
          onForumChange={setForum}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          availableForums={forums ?? DEFAULT_FORUMS}
        />
      )}
      {hasSearched && (
        <SearchResults
          results={results}
          query={query}
          onResultClick={onResultClick}
        />
      )}
    </Box>
  )
}
