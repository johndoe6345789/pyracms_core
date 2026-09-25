'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Box, Container, Typography } from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { RevisionDiffViewer } from '@/components/articles/RevisionDiffViewer'
import { RevertConfirmDialog } from '@/components/articles/RevertConfirmDialog'
import { SnippetRevisionTable } from '@/components/code/SnippetRevisionTable'
import {
  SnippetRevisionView,
  toRevisionView,
} from '@/components/code/SnippetRevisionView'
import { useSnippet } from '@/hooks/useSnippet'
import { useSnippetRevisions } from '@/hooks/useSnippetRevisions'
import { useTenantId } from '@/hooks/useTenantId'
import type { RootState } from '@/store/store'

export default function SnippetRevisionsPage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string
  const { tenantId } = useTenantId(slug)
  const { snippet } = useSnippet(id)
  const user = useSelector((s: RootState) => s.auth.user)
  const h = useSnippetRevisions(id, tenantId)
  const [viewing, setViewing] = useState<number | null>(null)
  const [reverting, setReverting] = useState<number | null>(null)
  const raw = viewing === null ? undefined : h.byNumber(viewing)
  const rev = h.revisions.find((r) => r.number === viewing)

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="snippet-revisions">
      <BackButton
        href={`/site/${slug}/snippets/${id}`}
        label="Back to Snippet"
      />
      <Typography variant="h3" component="h1" sx={{ mt: 2 }} gutterBottom>
        Revision History
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {snippet?.title ? `${snippet.title}: ` : ''}every saved version of this
        snippet. Reverting adds a new revision, so nothing is lost.
      </Typography>
      <ErrorAlert error={h.error} testId="revision-error" />
      <SnippetRevisionTable
        revisions={h.revisions}
        latest={h.latest}
        canRevert={!!user && user.id === snippet?.authorId}
        onView={(r) => setViewing(r.number)}
        onRevert={setReverting}
      />
      {h.diffs.length > 1 && (
        <Box data-testid="revisions-compare">
          <Typography variant="h5" sx={{ mt: 5, mb: 2 }}>
            Compare Revisions
          </Typography>
          <RevisionDiffViewer revisions={h.diffs} />
        </Box>
      )}
      <SnippetRevisionView
        revision={toRevisionView(raw, rev)}
        onClose={() => setViewing(null)}
      />
      <RevertConfirmDialog
        revisionNumber={reverting}
        onClose={() => setReverting(null)}
        onConfirm={() => {
          if (reverting !== null) h.revert(reverting)
          setReverting(null)
        }}
      />
    </Container>
  )
}
