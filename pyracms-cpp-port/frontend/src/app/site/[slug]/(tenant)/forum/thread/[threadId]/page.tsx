'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Container, Typography, Box, Divider, Chip, Pagination,
} from '@mui/material'
import { LockOutlined, PushPinOutlined } from '@mui/icons-material'
import { useThread } from '@/hooks/useThread'
import { useTenantId } from '@/hooks/useTenantId'
import { useForumUser } from '@/hooks/useForumUser'
import { PostCard } from '@/components/forum/PostCard'
import { QuickReplyForm } from '@/components/forum/QuickReplyForm'
import { ThreadActions } from '@/components/forum/ThreadActions'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'
import { ForumLoading, ForumError } from '@/components/forum/ForumStatus'

const PAGE_SIZE = 20

export default function ViewThreadPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const threadId = params.threadId as string
  const base = `/site/${slug}/forum`
  const { tenantId, loading: tenantLoading } = useTenantId(slug)
  const { isAuthenticated, isModerator } = useForumUser()
  const t = useThread(threadId, tenantId)
  const [page, setPage] = useState(1)

  const pages = Math.max(1, Math.ceil(t.posts.length / PAGE_SIZE))
  const current = Math.min(page, pages)
  const visible = t.posts.slice(
    (current - 1) * PAGE_SIZE, current * PAGE_SIZE,
  )
  const { thread } = t

  // Jump to the last page after posting (the new reply is at the end).
  const onSubmit = () => t.handleSubmitReply().then(() => setPage(9999))
  const onDeleteThread = () => t.handleDeleteThread().then(
    () => router.push(`${base}/${thread.forumId}`),
  )

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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
            {thread.title}
          </Typography>
          <ThreadActions
            threadId={threadId}
            isPinned={thread.pinned}
            isLocked={thread.locked}
            isModerator={isModerator}
            onPin={t.handleTogglePin}
            onLock={t.handleToggleLock}
            onDelete={onDeleteThread}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
          {thread.pinned && (
            <Chip icon={<PushPinOutlined />} label="Pinned" size="small"
              color="primary" />
          )}
          {thread.locked && (
            <Chip icon={<LockOutlined />} label="Locked" size="small"
              variant="outlined" />
          )}
        </Box>
        {thread.description && (
          <Typography variant="body1" color="text.secondary">
            {thread.description}
          </Typography>
        )}
      </Box>
      <Divider sx={{ mb: 4 }} />
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        data-testid="posts-list"
        role="list"
        aria-label="Thread posts"
      >
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canVote={isAuthenticated}
            onVote={t.handleVotePost}
            onEdit={t.handleEditPost}
            onDelete={t.handleDeletePost}
            {...(!thread.locked && isAuthenticated
              ? { onQuote: t.handleQuote } : {})}
          />
        ))}
      </Box>
      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pages}
            page={current}
            onChange={(_, v) => setPage(v)}
            color="primary"
            aria-label="Post pagination"
            data-testid="post-pagination"
          />
        </Box>
      )}
      <QuickReplyForm
        value={t.replyContent}
        onChange={t.setReplyContent}
        onSubmit={onSubmit}
        submitting={t.submitting}
        error={t.replyError}
        locked={thread.locked}
        isAuthenticated={isAuthenticated}
      />
    </Container>
  )
}
