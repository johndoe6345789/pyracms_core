'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useRevisions } from '@/hooks/useRevisions'
import { useTenantId } from '@/hooks/useTenantId'
import { BackButton } from '@/components/common/BackButton'
import { RevisionTable } from '@/components/articles/RevisionTable'

export default function RevisionsPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const { revisions, latestRevision, handleRevert } = useRevisions(name, tenantId)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <BackButton href={`/site/${slug}/articles/${name}`} label="Back to Article" />
        <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
          Revision History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage past revisions of this article.
        </Typography>
      </Box>
      <RevisionTable revisions={revisions} latestRevision={latestRevision} articleName={name} tenantId={tenantId} onRevert={handleRevert} />
    </Container>
  )
}
