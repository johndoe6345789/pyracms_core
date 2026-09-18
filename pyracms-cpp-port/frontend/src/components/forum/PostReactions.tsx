'use client'

import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { AddReactionOutlined } from '@mui/icons-material'
import { ReactionBadge } from './ReactionBadge'
import { ReactionPicker } from './ReactionPicker'
import {
  DEFAULT_REACTIONS, REACTIONS, toggleReaction, type Reaction,
} from './reactionData'

interface PostReactionsProps {
  postId: string
  initialReactions?: Reaction[]
  onReact?: (id: string, e: string) => void
}

export function PostReactions({
  postId, initialReactions, onReact,
}: PostReactionsProps) {
  const [list, setList] =
    useState<Reaction[]>(initialReactions ?? DEFAULT_REACTIONS)
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)

  const toggle = (em: string, lb: string) => {
    setList((prev) => toggleReaction(prev, em, lb))
    onReact?.(postId, em)
    setAnchor(null)
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
    }}>
      {list.map((r) => (
        <ReactionBadge key={r.label}
          emoji={r.emoji} label={r.label}
          count={r.count} reacted={r.reacted}
          onClick={() => toggle(r.emoji, r.label)} />
      ))}
      <IconButton size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ml: 0.5 }}
        aria-label="Add reaction"
        data-testid="add-reaction-btn">
        <AddReactionOutlined fontSize="small" />
      </IconButton>
      <ReactionPicker anchorEl={anchor}
        onClose={() => setAnchor(null)}
        reactions={REACTIONS}
        onPick={toggle} />
    </Box>
  )
}
