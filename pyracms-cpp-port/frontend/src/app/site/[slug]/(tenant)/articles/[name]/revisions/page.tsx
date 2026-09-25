'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useArticle } from '@/hooks/useArticle'
import { useRevisions } from '@/hooks/useRevisions'
import { useTenantId } from '@/hooks/useTenantId'
import { BackButton } from '@/components/common/BackButton'
import { RevisionTable } from '@/components/articles/RevisionTable'
import { RevisionDiffViewer } from '@/components/articles/RevisionDiffViewer'

export default function RevisionsPage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const { article } = useArticle(name, tenantId)
  const { revisions, diffs, latestRevision, handleRevert } = useRevisions(
    name,
    tenantId,
  )

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="revisions-page">
      <Box sx={{ mb: 4 }}>
        <BackButton
          href={`/site/${slug}/articles/${name}`}
          label="Back to Article"
          data-testid="back-to-article-btn"
        />
        <Typography variant="h3" component="h1" gutterBottom sx={{ mt: 2 }}>
          Revision History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage past revisions of this article.
        </Typography>
      </Box>
      <section
        aria-label="Revision history table"
        data-testid="revisions-section"
      >
        <RevisionTable
          revisions={revisions}
          latestRevision={latestRevision}
          articleName={name}
          {...(article?.renderer ? { renderer: article.renderer } : {})}
          tenantId={tenantId}
          onRevert={handleRevert}
        />
      </section>
      {diffs.length > 1 && (
        <section aria-label="Compare revisions" data-testid="revisions-compare">
          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
            Compare Revisions
          </Typography>
          <RevisionDiffViewer revisions={diffs} />
        </section>
      )}
    </Container>
  )
}
