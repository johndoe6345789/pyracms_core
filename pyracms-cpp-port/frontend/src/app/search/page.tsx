'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Container, Typography, Box, TextField, InputAdornment, Button, Paper,
  Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Chip, Pagination,
} from '@mui/material'
import {
  SearchOutlined, ArticleOutlined, ForumOutlined, CodeOutlined, PersonOutlined,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'

interface SearchResult {
  id: string
  type: 'article' | 'post' | 'snippet' | 'user'
  title: string
  snippet: string
  author: string
  date: string
  url: string
}

const ALL_RESULTS: SearchResult[] = [
  { id: '1', type: 'article', title: 'Getting Started with Next.js', snippet: 'A comprehensive guide to building modern web applications with Next.js framework.', author: 'Alice', date: '2026-03-15', url: '/site/demo/articles/getting-started' },
  { id: '2', type: 'article', title: 'Advanced TypeScript Patterns', snippet: 'Deep dive into conditional types, mapped types, and template literal types.', author: 'Alice', date: '2026-03-17', url: '/site/demo/articles/typescript-patterns' },
  { id: '3', type: 'post', title: 'Next.js vs Remix: Which should I choose?', snippet: 'I have been using Next.js for about two years now and recently tried Remix.', author: 'Alice', date: '2026-03-18', url: '/site/demo/forum/thread/1' },
  { id: '4', type: 'post', title: 'Best practices for React components', snippet: 'When building React components, always consider composition over inheritance.', author: 'Bob', date: '2026-03-14', url: '/site/demo/forum/thread/2' },
  { id: '5', type: 'snippet', title: 'Fibonacci Sequence', snippet: 'def fibonacci(n): Generate Fibonacci sequence up to n terms.', author: 'Alice', date: '2026-03-15', url: '/site/demo/snippets/snippet-1' },
  { id: '6', type: 'snippet', title: 'Quick Sort Algorithm', snippet: 'def quicksort(arr): Sort array using quicksort algorithm.', author: 'Bob', date: '2026-03-14', url: '/site/demo/snippets/snippet-2' },
  { id: '7', type: 'user', title: 'Alice Johnson', snippet: 'Full-stack developer, Next.js and TypeScript enthusiast.', author: '', date: '2025-01-10', url: '/users/alice' },
  { id: '8', type: 'user', title: 'Bob Williams', snippet: 'Backend developer, Rust and Go specialist.', author: '', date: '2025-03-22', url: '/users/bob' },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined />,
  post: <ForumOutlined />,
  snippet: <CodeOutlined />,
  user: <PersonOutlined />,
}

const TYPE_COLORS: Record<string, string> = {
  article: '#1976d2',
  post: '#ed6c02',
  snippet: '#2e7d32',
  user: '#9c27b0',
}

const ITEMS_PER_PAGE = 5

function highlightMatch(text: string, highlight: string): string {
  if (!highlight) return text
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return DOMPurify.sanitize(text.replace(regex, '<mark>$1</mark>'))
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(1)

  const tabTypes = ['all', 'article', 'post', 'snippet', 'user']
  const activeType = tabTypes[activeTab]

  const filtered = ALL_RESULTS.filter((r) => {
    const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.snippet.toLowerCase().includes(query.toLowerCase())
    const matchesType = activeType === 'all' || r.type === activeType
    return matchesQuery && matchesType
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const typeCounts = tabTypes.slice(1).map((type) => ({
    type,
    count: ALL_RESULTS.filter((r) => {
      const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.snippet.toLowerCase().includes(query.toLowerCase())
      return matchesQuery && r.type === type
    }).length,
  }))

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" component="h1" gutterBottom>Search</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search everything..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
        />
        <Button variant="contained">Search</Button>
      </Box>

      <Tabs value={activeTab} onChange={(_, v) => { setActiveTab(v); setPage(1) }} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={`All (${filtered.length})`} />
        {typeCounts.map((tc) => (
          <Tab key={tc.type} label={`${tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}s (${tc.count})`} />
        ))}
      </Tabs>

      {paginated.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderColor: 'divider' }}>
          <Typography color="text.secondary">
            {query ? `No results found for "${query}"` : 'Enter a search query to find content.'}
          </Typography>
        </Paper>
      ) : (
        <List disablePadding>
          {paginated.map((result, idx) => (
            <ListItem
              key={result.id}
              component="a"
              href={result.url}
              divider={idx < paginated.length - 1}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 0, py: 2, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: TYPE_COLORS[result.type], mt: 0.5 }}>
                {TYPE_ICONS[result.type]}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{result.title}</Typography>
                    <Chip label={result.type} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: TYPE_COLORS[result.type] + '20', color: TYPE_COLORS[result.type] }} />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      component="span"
                      dangerouslySetInnerHTML={{ __html: highlightMatch(result.snippet, query) }}
                    />
                    {result.author && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        by {result.author} - {result.date}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}
    </Container>
  )
}
