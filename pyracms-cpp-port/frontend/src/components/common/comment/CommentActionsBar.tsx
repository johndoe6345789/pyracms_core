'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import type { Comment } from './types'
import CommentActions from './CommentActions'
import type { useCommentActions } from './useCommentActions'

interface Props {
  comment: Comment
  a: ReturnType<typeof useCommentActions>
  depth: number
  onReply: () => void
}

export default function CommentActionsBar({ comment: c, a, ...p }: Props) {
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated)
  const usr = useSelector((s: RootState) => s.auth.user)
  return (
    <CommentActions
      comment={c}
      isAuthenticated={isAuth}
      isOwner={usr?.id === c.userId}
      depth={p.depth}
      onVote={(v) => a.vote(v, isAuth)}
      onReply={p.onReply}
      onEdit={() => a.setEditing(true)}
      onDelete={() => a.setDelOpen(true)}
    />
  )
}
