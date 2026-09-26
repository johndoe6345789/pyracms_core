'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Box, Container, Stack, Typography } from '@mui/material'
import KindTabs from '@/components/search/KindTabs'
import ResultList from '@/components/search/ResultList'
import SearchBox from '@/components/search/SearchBox'
import SearchLanding from '@/components/search/SearchLanding'
import { useSiteSearch } from '@/hooks/useSiteSearch'

function SiteSearch({ slug }: { slug: string }) {
  const s = useSiteSearch(slug)
  const total = s.data?.totalCount ?? 0
  const searched = s.q !== '' && s.data !== null && !s.loading
  const none = searched && total === 0 && s.type === 'all'

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 3, md: 5 } }}
      data-testid="search-page"
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Search
      </Typography>
      <SearchBox value={s.q} onSubmit={s.submit} autoFocus={s.q === ''} />
      <Stack spacing={2.5} sx={{ mt: 3 }}>
        {s.data && total + Object.keys(s.data.facets).length > 0 && (
          <KindTabs
            facets={s.data.facets}
            active={s.type}
            total={total}
            onChange={s.setType}
          />
        )}
        {searched && total > 0 && (
          <Typography color="text.secondary" role="status">
            {total} {total === 1 ? 'result' : 'results'} for &quot;{s.q}&quot;
          </Typography>
        )}
        {s.q !== '' && !none && (
          <ResultList
            slug={slug}
            query={s.q}
            hits={s.data?.items ?? []}
            total={total}
            page={s.page}
            loading={s.loading}
            failed={s.failed}
            onPage={s.setPage}
          />
        )}
        {(s.q === '' || none) && (
          <SearchLanding slug={slug} {...(none ? { missed: s.q } : {})} />
        )}
      </Stack>
    </Container>
  )
}

export default function SiteSearchPage() {
  const slug = useParams().slug as string
  return (
    <Suspense fallback={<Box sx={{ minHeight: 300 }} />}>
      <SiteSearch slug={slug} />
    </Suspense>
  )
}
