'use client'

import { Paper, Box } from '@mui/material'
import { PostDeleteDialog } from './PostDeleteDialog'
import { PostMainContent } from './PostMainContent'
import { PostFooter } from './PostFooter'
import { PostAuthorInfo } from './PostAuthorInfo'
import { usePostCardState } from './usePostCardState'
import type { Post } from '@/hooks/useThread'
import { useUserStats } from '@/hooks/useUserStats'

interface PostCardProps {
  post: Post
  onVote?: (id: string, l: boolean) => void
  onEdit?: (id: string, c: string) => Promise<unknown>
  onDelete?: (id: string) => Promise<unknown>
  onQuote?: (author: string, content: string) => void
  canVote?: boolean
  tenantId?: number | null
}

export function PostCard({
  post,
  onVote,
  onEdit,
  onDelete,
  onQuote,
  canVote = true,
  tenantId = null,
}: PostCardProps) {
  const s = usePostCardState({
    id: post.id,
    content: post.content,
    onEdit,
    onDelete,
  })
  const stats = useUserStats(post.authorId, tenantId)
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderColor: 'divider',
        display: 'flex',
        gap: 2,
        flexDirection: { xs: 'column', md: 'row' },
      }}
      data-testid={`post-card-${post.id}`}
    >
      {stats && <PostAuthorInfo username={post.author} stats={stats} />}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <PostMainContent post={post} s={s} showAuthor={!stats} />
        <PostFooter
          post={post}
          canVote={canVote}
          onVote={onVote}
          onQuote={onQuote}
        />
      </Box>
      <PostDeleteDialog
        open={s.confirmDel}
        onClose={() => s.setConfirmDel(false)}
        onConfirm={s.remove}
      />
    </Paper>
  )
}
