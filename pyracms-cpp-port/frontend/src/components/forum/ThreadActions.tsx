'use client'

import { useState } from 'react'
import { IconButton } from '@mui/material'
import { MoreVertOutlined } from
  '@mui/icons-material'
import { ThreadActionsMenu } from
  './ThreadActionsMenu'
import { MoveThreadDialog } from
  './MoveThreadDialog'
import { DeleteThreadDialog } from
  './DeleteThreadDialog'

interface ThreadActionsProps {
  threadId: string
  isPinned: boolean
  isLocked: boolean
  isModerator: boolean
  forums?: { id: string; name: string }[]
  onPin?: () => void
  onLock?: () => void
  onMove?: (forumId: string) => void
  onDelete?: () => void
}

const DEFAULT_FORUMS = [
  { id: 'general', name: 'General' },
  { id: 'tech', name: 'Technology' },
  { id: 'help', name: 'Help & Support' },
  { id: 'off-topic', name: 'Off Topic' },
]

export function ThreadActions({
  threadId, isPinned, isLocked,
  isModerator, forums = [],
  onPin, onLock, onMove, onDelete,
}: ThreadActionsProps) {
  const [anchor, setAnchor] =
    useState<null | HTMLElement>(null)
  const [delOpen, setDelOpen] =
    useState(false)
  const [moveOpen, setMoveOpen] =
    useState(false)
  const [moveTo, setMoveTo] = useState('')

  if (!isModerator) return null

  const close = () => setAnchor(null)
  const pf = forums.length > 0
    ? forums : DEFAULT_FORUMS

  return (<>
    <IconButton size="small"
      onClick={e =>
        setAnchor(e.currentTarget)}
      aria-label="Thread actions"
      data-testid={
        `thread-actions-${threadId}`}>
      <MoreVertOutlined />
    </IconButton>
    <ThreadActionsMenu anchorEl={anchor}
      onClose={close}
      isPinned={isPinned}
      isLocked={isLocked}
      onPin={() => { onPin?.(); close() }}
      onLock={() => { onLock?.(); close() }}
      onMove={() => {
        close(); setMoveOpen(true) }}
      onDelete={() => {
        close(); setDelOpen(true) }} />
    <MoveThreadDialog open={moveOpen}
      onClose={() => setMoveOpen(false)}
      onConfirm={id => {
        if (id) onMove?.(id)
        setMoveOpen(false); setMoveTo('')
      }}
      forums={pf} targetForum={moveTo}
      onTargetForumChange={setMoveTo} />
    <DeleteThreadDialog open={delOpen}
      onClose={() => setDelOpen(false)}
      onConfirm={() => {
        onDelete?.(); setDelOpen(false)
      }} />
  </>)
}
