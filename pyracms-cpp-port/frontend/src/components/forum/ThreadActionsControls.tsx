'use client'

import { useState } from 'react'
import { IconButton } from '@mui/material'
import { MoreVertOutlined } from '@mui/icons-material'
import { ThreadActionsMenu } from './ThreadActionsMenu'

interface Props {
  threadId: string
  isPinned: boolean
  isLocked: boolean
  onPin?: (() => void) | undefined
  onLock?: (() => void) | undefined
  onMove?: (() => void) | undefined
  onDelete: () => void
}

/** The kebab button and its pin/lock/move/delete menu. */
export function ThreadActionsControls({
  threadId,
  isPinned,
  isLocked,
  onPin,
  onLock,
  onMove,
  onDelete,
}: Props) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const close = () => setAnchor(null)
  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Thread actions"
        data-testid={`thread-actions-${threadId}`}
      >
        <MoreVertOutlined />
      </IconButton>
      <ThreadActionsMenu
        anchorEl={anchor}
        onClose={close}
        isPinned={isPinned}
        isLocked={isLocked}
        onPin={() => {
          onPin?.()
          close()
        }}
        onLock={() => {
          onLock?.()
          close()
        }}
        onMove={
          onMove
            ? () => {
                close()
                onMove()
              }
            : undefined
        }
        onDelete={() => {
          close()
          onDelete()
        }}
      />
    </>
  )
}
