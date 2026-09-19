'use client'

import { useRef } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import AutocompleteDropdown from './search/AutocompleteDropdown'
import { useAutocomplete } from './search/useAutocomplete'

interface Props {
  tenantId?: number | null
  onSelect?: (url: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
}
export default function SearchAutocomplete({
  tenantId,
  onSelect,
  onSearch,
  placeholder = 'Search...',
}: Props) {
  const { q, setQ, res, open, setOpen, chg } = useAutocomplete(tenantId)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div style={{ position: 'relative' }}>
      <TextField
        inputRef={ref}
        fullWidth
        size="small"
        placeholder={placeholder}
        value={q}
        onChange={(e) => chg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setOpen(false)
            onSearch?.(q)
          }
        }}
        onFocus={() => res.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        data-testid="search-autocomplete-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ),
        }}
      />
      <AutocompleteDropdown
        open={open}
        anchorEl={ref.current}
        results={res}
        width={ref.current?.offsetWidth}
        onSelect={(r) => {
          setQ(r.text)
          setOpen(false)
          onSelect?.(r.url)
        }}
      />
    </div>
  )
}
