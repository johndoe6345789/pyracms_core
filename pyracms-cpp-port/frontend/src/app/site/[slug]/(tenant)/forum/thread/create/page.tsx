'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Container, Typography, Box, Alert } from '@mui/material'
import Link from 'next/link'
import { useCreateThread } from '@/hooks/useCreateThread'
import { useTenantId } from '@/hooks/useTenantId'
import { useForumUser } from '@/hooks/useForumUser'
import { CreateThreadForm } from '@/components/forum/CreateThreadForm'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'

export default function CreateThreadPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const forumId = searchParams.get('forumId') || ''
  const base = `/site/${slug}/forum`
  const { tenantId } = useTenantId(slug)
  const { isAuthenticated } = useForumUser()
  const {
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    loading,
    error,
    handleSubmit,
  } = useCreateThread(forumId, slug, tenantId)

  let body
  if (!forumId) {
    body = (
      <Alert severity="warning">
        No forum selected. <Link href={base}>Pick a forum</Link> and use its New
        Thread button.
      </Alert>
    )
  } else if (!isAuthenticated) {
    body = (
      <Alert severity="info">
        <Link href="/auth/login">Sign in</Link> to create a thread.
      </Alert>
    )
  } else {
    body = (
      <CreateThreadForm
        slug={slug}
        cancelHref={`${base}/${forumId}`}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        content={content}
        setContent={setContent}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
      />
    )
  }

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
      {body}
    </Container>
  )
}
