'use client'

import { useParams } from 'next/navigation'
import { Container, Box } from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import {
  SnippetLoading,
  SnippetNotFound,
} from '@/components/code/SnippetStatus'
import { SnippetHeader } from '@/components/code/SnippetHeader'
import { useSnippet } from '@/hooks/useSnippet'
import { useSnippetActions } from '@/hooks/useSnippetActions'
import { useTenantId } from '@/hooks/useTenantId'
import SnippetBody from './SnippetBody'

export default function ViewSnippetPage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string
  const base = `/site/${slug}/snippets`
  const { tenantId } = useTenantId(slug)
  const { snippet, loading, notFound, reload } = useSnippet(id)
  const act = useSnippetActions(id, base, tenantId)

  if (loading) return <SnippetLoading />
  if (notFound || !snippet) return <SnippetNotFound base={base} />

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="view-snippet-page">
      <Box sx={{ mb: 2 }}>
        <BackButton href={base} label="Back to Snippets" />
      </Box>
      <SnippetHeader s={snippet} />
      <SnippetBody
        id={id}
        tenantId={tenantId}
        snippet={snippet}
        act={act}
        reload={reload}
      />
    </Container>
  )
}
