import { Alert, Pagination, Skeleton, Stack } from '@mui/material'
import { PAGE_SIZE, type SearchHit } from '@/lib/search/types'
import ResultCard from './ResultCard'

interface Props {
  slug: string
  hits: SearchHit[]
  total: number
  page: number
  loading: boolean
  failed: boolean
  onPage: (page: number) => void
}

/** The cards for one page of results, with paging underneath. */
export default function ResultList(p: Props) {
  if (p.failed)
    return <Alert severity="error">Search is unavailable right now.</Alert>
  if (p.loading && p.hits.length === 0)
    return (
      <Stack spacing={2} data-testid="search-loading">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={96} />
        ))}
      </Stack>
    )
  const pages = Math.ceil(p.total / PAGE_SIZE)
  return (
    <Stack spacing={2} sx={{ opacity: p.loading ? 0.6 : 1 }}>
      {p.hits.map((h, i) => (
        <ResultCard key={`${h.type}:${h.id}`} hit={h} index={i} slug={p.slug} />
      ))}
      {pages > 1 && (
        <Pagination
          count={pages}
          page={p.page}
          onChange={(_, n) => p.onPage(n)}
          sx={{ alignSelf: 'center', pt: 1 }}
        />
      )}
    </Stack>
  )
}
