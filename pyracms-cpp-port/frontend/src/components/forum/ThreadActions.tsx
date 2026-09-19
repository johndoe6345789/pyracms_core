'use client'

import { useState } from 'react'
import { ThreadActionsControls } from './ThreadActionsControls'
import { ThreadActionDialogs } from './ThreadActionDialogs'

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

export function ThreadActions({
  threadId,
  isPinned,
  isLocked,
  isModerator,
  forums = [],
  onPin,
  onLock,
  onMove,
  onDelete,
}: ThreadActionsProps) {
  const [delOpen, setDelOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveTo, setMoveTo] = useState('')

  if (!isModerator) return null

  return (
    <>
      <ThreadActionsControls
        threadId={threadId}
        isPinned={isPinned}
        isLocked={isLocked}
        onPin={onPin}
        onLock={onLock}
        onMove={onMove ? () => setMoveOpen(true) : undefined}
        onDelete={() => setDelOpen(true)}
      />
      <ThreadActionDialogs
        moveOpen={moveOpen}
        setMoveOpen={setMoveOpen}
        moveTo={moveTo}
        setMoveTo={setMoveTo}
        delOpen={delOpen}
        setDelOpen={setDelOpen}
        forums={forums}
        onMove={onMove}
        onDelete={onDelete}
      />
    </>
  )
}
