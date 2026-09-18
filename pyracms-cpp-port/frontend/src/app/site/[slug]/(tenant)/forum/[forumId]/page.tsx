'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useThreadList } from '@/hooks/useThreadList'
import { useTenantId } from '@/hooks/useTenantId'
import { useForumUser } from '@/hooks/useForumUser'
import { ThreadTable } from '@/components/forum/ThreadTable'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'
import {
  ForumLoading, ForumError, ForumEmpty,
} from '@/components/forum/ForumStatus'

export default function ThreadListPage() {
  const params = useParams()
  const slug = params.slug as string
  const forumId = params.forumId as string
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const { isAuthenticated } = useForumUser()
  const { forum, threads, loading, error } = useThreadList(forumId, tenantId)
  const busy = tenantLoading || loading
  const base = `/site/${slug}/forum`

  let body
  if (busy) {
    body = <ForumLoading />
  } else if (error || !tenantId) {
    body = <ForumError message={error || 'Site not found.'} />
  } else if (threads.length === 0) {
    body = (
      <ForumEmpty
        title="No threads yet"
        hint="Be the first to start a discussion."
      />
    )
  } else {
    body = <ThreadTable threads={threads} slug={slug} />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="thread-list-page">
      <ForumBreadcrumbs
        crumbs={[
          { label: 'Forum', href: base },
          { label: forum.name || 'Threads' },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {forum.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {forum.description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          component={Link}
          href={
            isAuthenticated
              ? `${base}/thread/create?forumId=${forumId}`
              : '/auth/login'
          }
          data-testid="new-thread-button"
        >
          {isAuthenticated ? 'New Thread' : 'Sign in to post'}
        </Button>
      </Box>
      {body}
    </Container>
  )
}
