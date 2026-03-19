'use client'

import { useState, useRef, useCallback } from 'react'
import {
  TextField, Paper, List, ListItem,
  ListItemIcon, ListItemText,
  Popper, InputAdornment, Chip,
} from '@mui/material'
import {
  SearchOutlined, ArticleOutlined,
  ForumOutlined, CodeOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'
import api from '@/lib/api'

interface Result {
  text: string; type: string; url: string
}
const ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  forum_post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  gamedep: (
    <SportsEsportsOutlined fontSize="small" />),
}

interface Props {
  tenantId?: number
  onSelect?: (url: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
}

export default function SearchAutocomplete({
  tenantId = 1, onSelect, onSearch,
  placeholder = 'Search...',
}: Props) {
  const [q, setQ] = useState('')
  const [results, setResults] =
    useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const timer = useRef<NodeJS.Timeout>(null)

  const onChange = useCallback((v: string) => {
    setQ(v)
    if (timer.current) clearTimeout(timer.current)
    if (v.length < 2) {
      setResults([]); setOpen(false); return
    }
    timer.current = setTimeout(async () => {
      try {
        const u = '/api/search/autocomplete?q='
          + encodeURIComponent(v)
          + `&tenant_id=${tenantId}&limit=8`
        const r = await api.get(u)
        setResults(r.data || [])
        setOpen((r.data || []).length > 0)
      } catch {
        setResults([]); setOpen(false)
      }
    }, 200)
  }, [tenantId])

  return (
    <div style={{ position: 'relative' }}>
      <TextField inputRef={ref} fullWidth
        size="small" placeholder={placeholder}
        value={q}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOpen(false); onSearch?.(q)
          }
        }}
        onFocus={() =>
          results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(
          () => setOpen(false), 200)}
        data-testid="search-autocomplete-input"
        InputProps={{ startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>) }} />
      <Popper open={open} anchorEl={ref.current}
        placement="bottom-start"
        sx={{ zIndex: 1300,
          width: ref.current?.offsetWidth }}>
        <Paper elevation={8}
          sx={{ maxHeight: 300,
            overflow: 'auto' }}>
          <List dense>
            {results.map((r, i) => (
              <ListItem key={i}
                onClick={() => {
                  setQ(r.text); setOpen(false)
                  onSelect?.(r.url)
                }}
                data-testid={
                  `autocomplete-item-${i}`}
                sx={{ cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover' } }}>
                <ListItemIcon
                  sx={{ minWidth: 32 }}>
                  {ICONS[r.type] || (
                    <SearchOutlined
                      fontSize="small" />)}
                </ListItemIcon>
                <ListItemText
                  primary={r.text} />
                <Chip label={r.type}
                  size="small"
                  sx={{ height: 20,
                    fontSize: '0.6rem' }} />
              </ListItem>))}
          </List>
        </Paper>
      </Popper>
    </div>
  )
}
