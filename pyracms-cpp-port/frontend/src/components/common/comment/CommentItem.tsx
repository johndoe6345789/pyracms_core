'use client'

import { useState } from 'react'
import { Box, Avatar } from '@mui/material'
import type { Comment } from './types'
import ReplyBox from './ReplyBox'
import CommentHeader from './CommentHeader'
import CommentBodyView from './CommentBodyView'
import CommentActionsBar from './CommentActionsBar'
import CommentChildren from './CommentChildren'
import DeleteCommentDialog from './DeleteCommentDialog'
import { ErrorAlert } from '../ErrorAlert'
import { useCommentActions } from './useCommentActions'

interface Props {
  comment: Comment
  contentType: string
  contentId: number
  depth: number
  onRefresh: () => void
}
export default function CommentItem({
  comment: c,
  contentType,
  contentId,
  depth,
  onRefresh,
}: Props) {
  const [replying, setReplying] = useState(false)
  const [exp, setExp] = useState(true)
  const a = useCommentActions(c.id, c.body, onRefresh)
  return (
    <Box sx={{ ml: depth > 0 ? 3 : 0, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
          {c.username[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CommentHeader comment={c} />
          <ErrorAlert error={a.error} testId="comment-action-error" />
          <CommentBodyView comment={c} a={a} />
          <CommentActionsBar
            comment={c}
            a={a}
            depth={depth}
            onReply={() => setReplying(!replying)}
          />
          {replying && (
            <ReplyBox
              contentType={contentType}
              contentId={contentId}
              parentId={c.id}
              onDone={() => {
                setReplying(false)
                onRefresh()
              }}
              onCancel={() => setReplying(false)}
            />
          )}
          <CommentChildren
            items={c.children}
            expanded={exp}
            onToggle={() => setExp(!exp)}
            contentType={contentType}
            contentId={contentId}
            depth={depth}
            onRefresh={onRefresh}
          />
        </Box>
      </Box>
      <DeleteCommentDialog
        open={a.delOpen}
        onClose={() => a.setDelOpen(false)}
        onConfirm={a.del}
      />
    </Box>
  )
}
