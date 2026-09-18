'use client'

import { TextField, InputAdornment } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import SearchDialog from './SearchDialog'
import { useGlobalSearch } from './useGlobalSearch'

export function GlobalSearch() {
  const { open, setOpen, q, setQ, res } = useGlobalSearch()
  const router = useRouter()
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
