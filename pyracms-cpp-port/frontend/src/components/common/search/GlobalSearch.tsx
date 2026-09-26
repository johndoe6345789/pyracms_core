'use client'

import { Box, IconButton, InputAdornment, TextField } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import SearchDialog from './SearchDialog'
import { searchPagePath } from '@/lib/searchUrl'
import { useGlobalSearch } from './useGlobalSearch'

export function GlobalSearch() {
  const { open, setOpen, q, setQ, res, loading, slug } = useGlobalSearch()
  const router = useRouter()
  const t = useTranslations('common')
  return (
    <>
      <Box sx={{ display: { xs: 'none', xl: 'block' } }}>
        <TextField
          size="small"
          placeholder={`${t('search')}... (Cmd+K)`}
          onClick={() => setOpen(true)}
          data-testid="global-search-trigger"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
            readOnly: true,
          }}
          sx={{
            width: 240,
            cursor: 'pointer',
            '& .MuiInputBase-input': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>
      <IconButton
        onClick={() => setOpen(true)}
        aria-label={t('search')}
        data-testid="global-search-icon"
        sx={{ display: { xs: 'inline-flex', xl: 'none' } }}
      >
        <SearchOutlined />
      </IconButton>
      <SearchDialog
        open={open}
        query={q}
        results={res}
        loading={loading}
        onClose={() => setOpen(false)}
        onQueryChange={setQ}
        onSelect={(r) => {
          setOpen(false)
          router.push(r.url)
        }}
        onSearchPage={() => {
          setOpen(false)
          router.push(searchPagePath(slug, { q: q.trim() }))
        }}
      />
    </>
  )
}
