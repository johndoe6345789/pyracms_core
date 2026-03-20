'use client'

import { Button, Collapse } from '@mui/material'
import {
  ExpandMoreOutlined, ExpandLessOutlined,
} from '@mui/icons-material'
import type { Comment } from './types'
import CommentItem from './CommentItem'

interface Props {
  items: Comment[]
  expanded: boolean
  onToggle: () => void
  contentType: string
  contentId: number
  depth: number
  onRefresh: () => void
}

export default function CommentChildren({
  items, expanded: exp, onToggle,
  contentType, contentId, depth, onRefresh,
}: Props) {
  if (items.length === 0) return null
  const w = items.length === 1
    ? 'reply' : 'replies'
  return (<>
    <Button size="small" onClick={onToggle}
      startIcon={exp
        ? <ExpandLessOutlined />
        : <ExpandMoreOutlined />}
      sx={{ textTransform: 'none', mt: 0.5 }}
      data-testid="toggle-replies-btn">
      {exp ? 'Hide' : 'Show'}
      {' '}{items.length} {w}</Button>
    <Collapse in={exp}>
      {items.map((ch) =>
        <CommentItem key={ch.id} comment={ch}
          contentType={contentType}
          contentId={contentId}
          depth={depth + 1}
          onRefresh={onRefresh} />)}
    </Collapse>
  </>)
}
