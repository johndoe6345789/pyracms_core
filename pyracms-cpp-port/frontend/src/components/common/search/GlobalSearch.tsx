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
  const [query, setQuery] = useState('')
  const [results, setResults] =
    useState<SearchResult[]>([])
  const router = useRouter()
  const timer = useRef<ReturnType<
    typeof setTimeout>>(null)

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey)
        && e.key === 'k') {
        e.preventDefault(); setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }, [])

  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () =>
      document.removeEventListener(
        'keydown', onKey)
  }, [onKey])

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    if (query.length < 2) {
      setResults([]); return
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const m = window.location.pathname
        .match(/\/site\/([^/]+)/)
      const tp = m ? '&tenant_id=1' : ''
      const u = '/api/search/autocomplete?q='
        + encodeURIComponent(query) + tp
      api.get(u)
        .then(res => {
          const d = res.data.items
            || res.data || []
          setResults(d.map(
            (i: Record<string, unknown>) => ({
              id: String(i.id),
              type: i.type || 'article',
              title: i.title || '',
              snippet: i.snippet || '',
              url: i.url || '#',
            })))
        })
        .catch(() => setResults([]))
    }, 300)
  }, [query])

  return (
    <>
      <TextField size="small"
        placeholder="Search... (Cmd+K)"
        onClick={() => setOpen(true)}
        data-testid="global-search-trigger"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined fontSize="small" />
            </InputAdornment>),
          readOnly: true,
        }}
        sx={{ width: 240, cursor: 'pointer',
          '& .MuiInputBase-input': {
            cursor: 'pointer' } }} />
      <SearchDialog open={open} query={query}
        results={results}
        onClose={() => setOpen(false)}
        onQueryChange={setQuery}
        onSelect={(r) => {
          setOpen(false); router.push(r.url)
        }}
        onSearchPage={() => {
          setOpen(false)
          router.push('/search?q='
            + encodeURIComponent(query))
        }} />
    </>
  )
}
