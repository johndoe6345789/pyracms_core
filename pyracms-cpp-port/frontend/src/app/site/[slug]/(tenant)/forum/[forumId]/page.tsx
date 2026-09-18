'use client'

import { useParams } from 'next/navigation'
import { Container } from '@mui/material'
import { useThreadList } from '@/hooks/useThreadList'
import { useTenantId } from '@/hooks/useTenantId'
import { useForumUser } from '@/hooks/useForumUser'
import { ThreadListHeader } from '@/components/forum/ThreadListHeader'
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
      <ThreadListHeader
        name={forum.name}
        description={forum.description}
        href={`${base}/thread/create?forumId=${forumId}`}
        isAuthenticated={isAuthenticated}
      />
      {body}
    </Container>
  )
}
