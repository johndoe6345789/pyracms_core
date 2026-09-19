'use client'

import CommentForm from './CommentForm'

interface Props {
  contentType: string
  contentId: number
  parentId: number
  onDone: () => void
  onCancel: () => void
}

export default function ReplyBox(p: Props) {
  return (
    <CommentForm
      contentType={p.contentType}
      contentId={p.contentId}
      parentId={p.parentId}
      placeholder="Write a reply..."
      submitLabel="Reply"
      onSubmitted={p.onDone}
      onCancel={p.onCancel}
    />
  )
}
