'use client'

import { Paper, Box } from '@mui/material'
import { VoteButtons } from './VoteButtons'
import { QuoteButton } from './QuoteButton'
import { PostBody } from './PostBody'
import { PostCardHeader } from './PostCardHeader'
import { PostDeleteDialog } from './PostDeleteDialog'
import { PostReactions } from './PostReactions'
import { PostAuthorInfo } from './PostAuthorInfo'
import { usePostCardState } from './usePostCardState'
import { MentionTextField } from '../common/MentionTextField'
import type { Post } from '@/hooks/useThread'
import { useUserStats } from '@/hooks/useUserStats'
import { ErrorAlert } from '../common/ErrorAlert'

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
        <PostCardHeader
          author={post.author}
          date={post.date}
          showAuthor={!stats}
          isOwner={post.isOwner}
          editing={s.editing}
          onSave={s.save}
          onCancelEdit={s.cancel}
          onStartEdit={() => s.setEditing(true)}
          onDelete={() => s.setConfirmDel(true)}
        />
        <ErrorAlert error={s.error} testId="post-error" />
        {s.editing ? (
          <MentionTextField
            fullWidth
            multiline
            minRows={3}
            value={s.editContent}
            onValue={s.setEditContent}
            sx={{ mb: 2 }}
            data-testid="post-edit-input"
          />
        ) : (
          <PostBody content={post.content} />
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <VoteButtons
            likes={post.likes}
            dislikes={post.dislikes}
            disabled={!canVote}
            onVote={(l) => onVote?.(post.id, l)}
          />
          <PostReactions
            postId={post.id}
            disabled={!canVote}
            {...(post.reactions ? { reactions: post.reactions } : {})}
          />
          {onQuote && (
            <QuoteButton
              author={post.author}
              content={post.content}
              onQuote={() => onQuote(post.author, post.content)}
            />
          )}
        </Box>
      </Box>
      <PostDeleteDialog
        open={s.confirmDel}
        onClose={() => s.setConfirmDel(false)}
        onConfirm={s.remove}
      />
    </Paper>
  )
}
