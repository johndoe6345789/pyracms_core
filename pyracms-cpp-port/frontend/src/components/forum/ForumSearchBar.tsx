'use client'

import { useState } from 'react'
import {
  Box, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Button, Paper, Typography, Chip, List, ListItem, ListItemText,
} from '@mui/material'
import { SearchOutlined, FilterListOutlined } from '@mui/icons-material'
import DOMPurify from 'dompurify'
import api from '@/lib/api'

interface ForumSearchResult {
  id: string
  threadTitle: string
  postContent: string
  author: string
  date: string
  forumName: string
}

interface ForumSearchBarProps {
  forums?: string[]
  tenantId?: number | null
  onResultClick?: (result: ForumSearchResult) => void
}

export function ForumSearchBar({ forums, tenantId, onResultClick }: ForumSearchBarProps) {
  const [query, setQuery] = useState('')
  const [author, setAuthor] = useState('')
  const [forum, setForum] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<ForumSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const availableForums = forums ?? ['General Discussion', 'Technology', 'Help & Support', 'Off Topic']

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (tenantId) params.set('tenant_id', String(tenantId))
    params.set('type', 'forum_post')

    api.get(`/api/search?${params.toString()}`)
      .then(res => {
        const items = res.data.items || res.data || []
        let mapped: ForumSearchResult[] = items.map((item: Record<string, unknown>) => ({
          id: String(item.id),
          threadTitle: item.title || '',
          postContent: item.snippet || item.content || '',
          author: item.author || '',
          date: typeof item.createdAt === 'string' ? (item.createdAt as string).split('T')[0] : '',
          forumName: item.forumName || '',
        }))
        if (author) mapped = mapped.filter(r => r.author.toLowerCase().includes(author.toLowerCase()))
        if (forum) mapped = mapped.filter(r => r.forumName === forum)
        setResults(mapped)
        setHasSearched(true)
      })
      .catch(() => {
        setResults([])
        setHasSearched(true)
      })
  }

  const highlightMatch = (text: string, highlight: string): string => {
    // All output is sanitized through DOMPurify before rendering
    if (!highlight) return DOMPurify.sanitize(text)
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    return DOMPurify.sanitize(text.replace(regex, '<mark>$1</mark>'))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          placeholder="Search forum posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListOutlined />}
          onClick={() => setShowFilters(!showFilters)}
          size="small"
        >
          Filters
        </Button>
        <Button variant="contained" onClick={handleSearch} size="small">
          Search
        </Button>
      </Box>

      {showFilters && (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderColor: 'divider' }}>
          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Forum</InputLabel>
            <Select value={forum} label="Forum" onChange={(e) => setForum(e.target.value)}>
              <MenuItem value="">All Forums</MenuItem>
              {availableForums.map((f) => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Paper>
      )}

      {hasSearched && (
        <Paper variant="outlined" sx={{ borderColor: 'divider' }}>
          {results.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography color="text.secondary">No results found.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {results.map((result, idx) => (
                <ListItem
                  key={result.id}
                  divider={idx < results.length - 1}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => onResultClick?.(result)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {result.threadTitle}
                        </Typography>
                        {result.forumName && <Chip label={result.forumName} size="small" variant="outlined" />}
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Typography
                          variant="body2"
                          component="span"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(result.postContent.substring(0, 200), query) }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          by {result.author} on {result.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  )
}
