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
  const [res, setRes] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const tm = useRef<NodeJS.Timeout>(null)
  const chg = useCallback((v: string) => {
    setQ(v)
    if (tm.current) clearTimeout(tm.current)
    if (v.length < 2) {
      setRes([]); setOpen(false); return }
    tm.current = setTimeout(async () => {
      try {
        const u = '/api/search/autocomplete?q='
          + encodeURIComponent(v)
          + `&tenant_id=${tenantId}&limit=8`
        const r = await api.get(u)
        setRes(r.data || [])
        setOpen((r.data || []).length > 0)
      } catch { setRes([]); setOpen(false) }
    }, 200)
  }, [tenantId])
  return (
    <div style={{ position: 'relative' }}>
      <TextField inputRef={ref} fullWidth
        size="small" placeholder={placeholder}
        value={q}
        onChange={(e) => chg(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter')
          { setOpen(false); onSearch?.(q) } }}
        onFocus={() =>
          res.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(
          () => setOpen(false), 200)}
        data-testid="search-autocomplete-input"
        InputProps={{ startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>) }} />
      <Popper open={open}
        anchorEl={ref.current}
        placement="bottom-start"
        sx={{ zIndex: 1300,
          width: ref.current?.offsetWidth }}>
        <Paper elevation={8} sx={{
          maxHeight: 300, overflow: 'auto' }}>
          <List dense>
            {res.map((r, i) => (
              <ListItem key={i}
                onClick={() => { setQ(r.text)
                  setOpen(false)
                  onSelect?.(r.url) }}
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
                  size="small" sx={{
                    height: 20,
                    fontSize: '0.6rem' }} />
              </ListItem>))}
          </List>
        </Paper>
      </Popper>
    </div>)
}
