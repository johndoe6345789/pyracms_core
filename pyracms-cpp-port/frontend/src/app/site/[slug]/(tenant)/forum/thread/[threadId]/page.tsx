'use client'

import { useParams, useRouter } from 'next/navigation'
import { Container } from '@mui/material'
import { useThread } from '@/hooks/useThread'
import { useTenantId } from '@/hooks/useTenantId'
import { ThreadContent } from '@/components/forum/ThreadContent'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'
import { ForumLoading, ForumError } from '@/components/forum/ForumStatus'

export default function ViewThreadPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const threadId = params.threadId as string
  const base = `/site/${slug}/forum`
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const t = useThread(threadId, tenantId)
  const { thread } = t

  if (tenantLoading || t.loading) {
    return <Container sx={{ py: 6 }}><ForumLoading /></Container>
  }
  if (t.error || !tenantId) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }} data-testid="view-thread-page">
        <ForumBreadcrumbs crumbs={[{ label: 'Forum', href: base }]} />
        <ForumError message={t.error || 'Site not found.'} />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="view-thread-page">
      <ForumBreadcrumbs
        crumbs={[
          { label: 'Forum', href: base },
          {
            label: thread.forumName || 'Threads',
            href: `${base}/${thread.forumId}`,
          },
          { label: thread.title },
        ]}
      />
      <ThreadContent
        t={t}
        threadId={threadId}
        tenantId={tenantId}
        onDeleted={() => router.push(`${base}/${thread.forumId}`)}
      />
    </Container>
  )
}
