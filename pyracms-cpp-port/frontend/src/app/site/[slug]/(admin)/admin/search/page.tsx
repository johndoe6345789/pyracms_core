'use client'

import { useParams } from 'next/navigation'
import { Container, Typography } from '@mui/material'
import { useTenantId } from '@/hooks/useTenantId'
import { useSearchIndexing } from '@/hooks/admin/useSearchIndexing'
import { SearchIndexingPanel } from '@/components/admin/SearchIndexingPanel'
import { ErrorAlert } from '@/components/common/ErrorAlert'

export default function SearchIndexingPage() {
  const slug = useParams().slug as string
  const { tenantId } = useTenantId(slug)
  const s = useSearchIndexing(tenantId)
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Search Indexing
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        How this site&apos;s content reaches the search engine.
      </Typography>
      <ErrorAlert error={s.error} testId="search-indexing-error" />
      {!s.loading && <SearchIndexingPanel s={s} />}
    </Container>
  )
}
