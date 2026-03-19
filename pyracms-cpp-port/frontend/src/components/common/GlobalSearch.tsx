'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, TextField, InputAdornment, Paper, Typography, List, ListItem, ListItemIcon, ListItemText,
  Chip, Dialog, DialogContent, Fade,
} from '@mui/material'
import {
  SearchOutlined, ArticleOutlined, ForumOutlined, CodeOutlined, PersonOutlined, CloseOutlined,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'article' | 'post' | 'snippet' | 'user'
  title: string
  snippet: string
  url: string
}

const PLACEHOLDER_RESULTS: SearchResult[] = [
  { id: '1', type: 'article', title: 'Getting Started with Next.js', snippet: 'A comprehensive guide to building applications with Next.js...', url: '/site/demo/articles/getting-started' },
  { id: '2', type: 'article', title: 'Advanced TypeScript Patterns', snippet: 'Deep dive into conditional types, mapped types...', url: '/site/demo/articles/typescript-patterns' },
  { id: '3', type: 'post', title: 'Next.js vs Remix discussion', snippet: 'I have been using Next.js for about two years...', url: '/site/demo/forum/thread/1' },
  { id: '4', type: 'snippet', title: 'Fibonacci Sequence', snippet: 'def fibonacci(n): a, b = 0, 1...', url: '/site/demo/snippets/snippet-1' },
  { id: '5', type: 'user', title: 'Alice Johnson', snippet: 'Full-stack developer, Next.js enthusiast', url: '/users/alice' },
  { id: '6', type: 'post', title: 'Best practices for React', snippet: 'When building React components, always consider...', url: '/site/demo/forum/thread/2' },
  { id: '7', type: 'snippet', title: 'Quick Sort', snippet: 'def quicksort(arr): if len(arr) <= 1...', url: '/site/demo/snippets/snippet-2' },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  user: <PersonOutlined fontSize="small" />,
}

const TYPE_COLORS: Record<string, string> = {
  article: '#1976d2',
  post: '#ed6c02',
  snippet: '#2e7d32',
  user: '#9c27b0',
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [open])

  const results = query.length >= 2
    ? PLACEHOLDER_RESULTS.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.snippet.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    router.push(result.url)
  }

  const handleSearchPage = () => {
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <TextField
        size="small"
        placeholder="Search... (Cmd+K)"
        onClick={() => setOpen(true)}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>,
          readOnly: true,
        }}
        sx={{ width: 240, cursor: 'pointer', '& .MuiInputBase-input': { cursor: 'pointer' } }}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        sx={{ '& .MuiDialog-paper': { mt: '10vh', borderRadius: 2 } }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="Search articles, posts, snippets, users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) handleSearchPage()
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment>,
              endAdornment: query && (
                <InputAdornment position="end">
                  <Chip label="Enter to search all" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiInputBase-root': { py: 1.5 } }}
          />

          {results.length > 0 && (
            <Box sx={{ borderTop: 1, borderColor: 'divider', maxHeight: 400, overflow: 'auto' }}>
              {Object.entries(grouped).map(([type, items]) => (
                <Box key={type}>
                  <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600, bgcolor: 'background.default' }}>
                    {type}s
                  </Typography>
                  <List disablePadding>
                    {items.map((result) => (
                      <ListItem
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, px: 2, py: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: TYPE_COLORS[result.type] }}>
                          {TYPE_ICONS[result.type]}
                        </ListItemIcon>
                        <ListItemText
                          primary={result.title}
                          secondary={result.snippet.substring(0, 80) + '...'}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </Box>
          )}

          {query.length >= 2 && results.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
              <Typography color="text.secondary">No results found for &quot;{query}&quot;</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
