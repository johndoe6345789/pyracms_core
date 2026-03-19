'use client'

import { useState, useRef, useCallback } from 'react'
import {
  TextField, Paper, List, ListItem, ListItemIcon, ListItemText,
  Popper, InputAdornment, Chip,
} from '@mui/material'
import {
  SearchOutlined, ArticleOutlined, ForumOutlined, CodeOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'
import api from '@/lib/api'

interface AutocompleteResult {
  text: string
  type: string
  url: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  forum_post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  gamedep: <SportsEsportsOutlined fontSize="small" />,
}

interface SearchAutocompleteProps {
  tenantId?: number
  onSelect?: (url: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function SearchAutocomplete({
  tenantId = 1,
  onSelect,
  onSearch,
  placeholder = 'Search...',
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  const handleChange = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/api/search/autocomplete?q=${encodeURIComponent(value)}&tenant_id=${tenantId}&limit=8`)
        setResults(res.data || [])
        setOpen((res.data || []).length > 0)
      } catch {
        setResults([])
        setOpen(false)
      }
    }, 200)
  }, [tenantId])

  const handleSelect = (result: AutocompleteResult) => {
    setQuery(result.text)
    setOpen(false)
    onSelect?.(result.url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setOpen(false)
      onSearch?.(query)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <TextField
        inputRef={inputRef}
        fullWidth
        size="small"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start"><SearchOutlined /></InputAdornment>
          ),
        }}
      />
      <Popper
        open={open}
        anchorEl={inputRef.current}
        placement="bottom-start"
        sx={{ zIndex: 1300, width: inputRef.current?.offsetWidth }}
      >
        <Paper elevation={8} sx={{ maxHeight: 300, overflow: 'auto' }}>
          <List dense>
            {results.map((r, i) => (
              <ListItem
                key={i}
                onClick={() => handleSelect(r)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {TYPE_ICONS[r.type] || <SearchOutlined fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={r.text} />
                <Chip label={r.type} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Popper>
    </div>
  )
}
