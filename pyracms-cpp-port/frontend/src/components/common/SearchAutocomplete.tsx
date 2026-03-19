'use client'

import { useState, useRef, useCallback } from 'react'
import {
  TextField, InputAdornment,
} from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import api from '@/lib/api'
import AutocompleteDropdown
  from './search/AutocompleteDropdown'

interface Result {
  text: string; type: string; url: string
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
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOpen(false); onSearch?.(q) } }}
        onFocus={() =>
          res.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(
          () => setOpen(false), 200)}
        data-testid="search-autocomplete-input"
        InputProps={{ startAdornment: (
          <InputAdornment position="start">
            <SearchOutlined />
          </InputAdornment>) }} />
      <AutocompleteDropdown open={open}
        anchorEl={ref.current} results={res}
        width={ref.current?.offsetWidth}
        onSelect={(r) => { setQ(r.text)
          setOpen(false)
          onSelect?.(r.url) }} />
    </div>)
}
