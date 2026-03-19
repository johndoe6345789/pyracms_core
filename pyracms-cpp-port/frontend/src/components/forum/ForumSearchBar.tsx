'use client'

import { useState } from 'react'
import {
  Box, TextField, InputAdornment, Button,
} from '@mui/material'
import {
  SearchOutlined, FilterListOutlined,
} from '@mui/icons-material'
import { SearchFilters } from './SearchFilters'
import { SearchResults } from './SearchResults'
import {
  useForumSearch,
  type ForumSearchResult,
} from './useForumSearch'

interface ForumSearchBarProps {
  forums?: string[]
  tenantId?: number | null
  onResultClick?: (
    result: ForumSearchResult
  ) => void
}

export type { ForumSearchResult }

const DEFAULT_FORUMS = [
  'General Discussion', 'Technology',
  'Help & Support', 'Off Topic',
]

export function ForumSearchBar({
  forums, tenantId, onResultClick,
}: ForumSearchBarProps) {
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState('')
  const [forum, setForum] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] =
    useState(false)
  const { results, hasSearched, search } =
    useForumSearch(tenantId)
  const af = forums ?? DEFAULT_FORUMS

  const go = () => search(query, author, forum)

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column', gap: 2,
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Search forum posts..."
          value={query}
          onChange={e =>
            setQuery(e.target.value)}
          size="small" fullWidth
          onKeyDown={e =>
            e.key === 'Enter' && go()}
          data-testid="forum-search-input"
          InputProps={{ startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ) }} />
        <Button variant="outlined"
          startIcon={<FilterListOutlined />}
          onClick={() =>
            setShowFilters(!showFilters)}
          size="small"
          data-testid={
            'forum-search-filters-btn'}
        >Filters</Button>
        <Button variant="contained"
          onClick={go} size="small"
          data-testid="forum-search-submit"
        >Search</Button>
      </Box>
      {showFilters && <SearchFilters
        author={author}
        onAuthorChange={setAuthor}
        forum={forum}
        onForumChange={setForum}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        availableForums={af} />}
      {hasSearched && <SearchResults
        results={results} query={query}
        onResultClick={onResultClick} />}
    </Box>
  )
}
