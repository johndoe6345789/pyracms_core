'use client'

import { Alert } from '@mui/material'
import Link from 'next/link'
import { useCreateThread } from '@/hooks/useCreateThread'
import { useForumUser } from '@/hooks/useForumUser'
import { CreateThreadForm } from '@/components/forum/CreateThreadForm'

interface Props {
  slug: string
  forumId: string
  base: string
  tenantId: number | null
}

export default function CreateThreadBody(p: Props) {
  const { isAuthenticated } = useForumUser()
  const t = useCreateThread(p.forumId, p.slug, p.tenantId)

  if (!p.forumId) {
    return (
      <Alert severity="warning">
        No forum selected. <Link href={p.base}>Pick a forum</Link> and use its
        New Thread button.
      </Alert>
    )
  }
  if (!isAuthenticated) {
    return (
      <Alert severity="info">
        <Link href="/auth/login">Sign in</Link> to create a thread.
      </Alert>
    )
  }
  return (
    <CreateThreadForm
      slug={p.slug}
      cancelHref={`${p.base}/${p.forumId}`}
      title={t.title}
      setTitle={t.setTitle}
      description={t.description}
      setDescription={t.setDescription}
      content={t.content}
      setContent={t.setContent}
      loading={t.loading}
      error={t.error}
      onSubmit={t.handleSubmit}
    />
  )
}
