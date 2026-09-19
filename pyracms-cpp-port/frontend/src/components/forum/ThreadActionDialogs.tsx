'use client'

import { MoveThreadDialog } from './MoveThreadDialog'
import { DeleteThreadDialog } from './DeleteThreadDialog'

interface Props {
  moveOpen: boolean
  setMoveOpen: (v: boolean) => void
  moveTo: string
  setMoveTo: (v: string) => void
  delOpen: boolean
  setDelOpen: (v: boolean) => void
  forums: { id: string; name: string }[]
  onMove?: ((forumId: string) => void) | undefined
  onDelete?: (() => void) | undefined
}

/** Move and delete confirmation dialogs of the thread actions menu. */
export function ThreadActionDialogs(p: Props) {
  return (
    <>
      <MoveThreadDialog
        open={p.moveOpen}
        onClose={() => p.setMoveOpen(false)}
        onConfirm={(id) => {
          if (id) p.onMove?.(id)
          p.setMoveOpen(false)
          p.setMoveTo('')
        }}
        forums={p.forums}
        targetForum={p.moveTo}
        onTargetForumChange={p.setMoveTo}
      />
      <DeleteThreadDialog
        open={p.delOpen}
        onClose={() => p.setDelOpen(false)}
        onConfirm={() => {
          p.onDelete?.()
          p.setDelOpen(false)
        }}
      />
    </>
  )
}
