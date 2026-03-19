'use client'

import {
  useState, useEffect, useCallback, useRef,
} from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { SearchResult }
  from './SearchResultsList'
import SearchDialog from './SearchDialog'

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [res, setRes] =
    useState<SearchResult[]>([])
  const router = useRouter()
  const t = useRef<ReturnType<
    typeof setTimeout>>(null)
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey)
        && e.key === 'k') {
        e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }, [])
  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener(
      'keydown', onKey)
  }, [onKey])
  useEffect(() => {
    if (!open) { setQ(''); setRes([]) }
  }, [open])
  useEffect(() => {
    if (q.length < 2) { setRes([]); return }
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(() => {
      const m = window.location.pathname
        .match(/\/site\/([^/]+)/)
      const tp = m ? '&tenant_id=1' : ''
      const u = '/api/search/autocomplete?q='
        + encodeURIComponent(q) + tp
      api.get(u).then(r => {
        const d = r.data.items || r.data || []
        setRes(d.map(
          (i: Record<string, unknown>) => ({
            id: String(i.id),
            type: i.type || 'article',
            title: i.title || '',
            snippet: i.snippet || '',
            url: i.url || '#',
          })))
      }).catch(() => setRes([]))
    }, 300)
  }, [q])
  return (<>
    <TextField size="small"
      placeholder="Search... (Cmd+K)"
      onClick={() => setOpen(true)}
      data-testid="global-search-trigger"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined fontSize="small" />
          </InputAdornment>),
        readOnly: true }}
      sx={{ width: 240, cursor: 'pointer',
        '& .MuiInputBase-input': {
          cursor: 'pointer' } }} />
    <SearchDialog open={open} query={q}
      results={res}
      onClose={() => setOpen(false)}
      onQueryChange={setQ}
      onSelect={(r) => {
        setOpen(false); router.push(r.url) }}
      onSearchPage={() => {
        setOpen(false)
        router.push('/search?q='
          + encodeURIComponent(q)) }} />
  </>)
}
