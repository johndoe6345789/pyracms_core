'use client'

import { PostBody } from './PostBody'
import { PostCardHeader } from './PostCardHeader'
import type { usePostCardState } from './usePostCardState'
import { MentionTextField } from '../common/MentionTextField'
import type { Post } from '@/hooks/useThread'
import { ErrorAlert } from '../common/ErrorAlert'

interface Props {
  post: Post
  s: ReturnType<typeof usePostCardState>
  showAuthor: boolean
}

/** Header, error and body (or edit field) of a post. */
export function PostMainContent({ post, s, showAuthor }: Props) {
  return (
    <>
      <PostCardHeader
        author={post.author}
        date={post.date}
        showAuthor={showAuthor}
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
    </>
  )
}
