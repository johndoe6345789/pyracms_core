'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'
import { useTenantId } from '@/hooks/useTenantId'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'
import CreateThreadBody from './CreateThreadBody'

export default function CreateThreadPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const forumId = searchParams.get('forumId') || ''
  const base = `/site/${slug}/forum`
  const { tenantId } = useTenantId(slug)

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="create-thread-page">
      <ForumBreadcrumbs
        crumbs={[
          { label: 'Forum', href: base },
          ...(forumId
            ? [{ label: 'Threads', href: `${base}/${forumId}` }]
            : []),
          { label: 'New Thread' },
        ]}
      />
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Create New Thread
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Start a new discussion topic in the forum.
        </Typography>
      </Box>
      <CreateThreadBody
        slug={slug}
        forumId={forumId}
        base={base}
        tenantId={tenantId}
      />
    </Container>
  )
}
