'use client'

import { useEffect, useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { AddReactionOutlined } from '@mui/icons-material'
import { ReactionBadge } from './ReactionBadge'
import { ReactionPicker } from './ReactionPicker'
import { REACTIONS, toggleReaction, type Reaction } from './reactionData'
import { setReaction } from '@/lib/forumReactions'

interface PostReactionsProps {
  postId: string
  reactions?: Reaction[]
  disabled?: boolean
}

/** Reaction badges; toggles optimistically and rolls back on failure. */
export function PostReactions({
  postId,
  reactions,
  disabled = false,
}: PostReactionsProps) {
  const [list, setList] = useState<Reaction[]>(reactions ?? [])
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  // Re-sync only when the server data changes, not on every re-render.
  const key = JSON.stringify(reactions ?? [])
  useEffect(() => setList(JSON.parse(key) as Reaction[]), [key])

  const toggle = (em: string, lb: string) => {
    setAnchor(null)
    if (disabled) return
    const prev = list
    const add = !prev.find((r) => r.emoji === em)?.reacted
    setList(toggleReaction(prev, em, lb))
    setReaction(postId, lb, add).catch(() => setList(prev))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexWrap: 'wrap',
      }}
    >
      {list.map((r) => (
        <ReactionBadge
          key={r.label}
          emoji={r.emoji}
          label={r.label}
          count={r.count}
          reacted={r.reacted}
          onClick={() => toggle(r.emoji, r.label)}
        />
      ))}
      <IconButton
        size="small"
        disabled={disabled}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ml: 0.5 }}
        aria-label="Add reaction"
        data-testid="add-reaction-btn"
      >
        <AddReactionOutlined fontSize="small" />
      </IconButton>
      <ReactionPicker
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        reactions={REACTIONS}
        onPick={toggle}
      />
    </Box>
  )
}
