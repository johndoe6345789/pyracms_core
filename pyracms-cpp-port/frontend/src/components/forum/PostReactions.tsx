'use client'

import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { AddReactionOutlined } from
  '@mui/icons-material'
import { ReactionBadge } from './ReactionBadge'
import { ReactionPicker } from
  './ReactionPicker'

interface Reaction {
  emoji: string; label: string
  count: number; reacted: boolean
}
interface PostReactionsProps {
  postId: string
  initialReactions?: Reaction[]
  onReact?: (id: string, e: string) => void
}

const REACTIONS = [
  { emoji: '\uD83D\uDC4D', label: 'thumbsup' },
  { emoji: '\u2764\uFE0F', label: 'heart' },
  { emoji: '\uD83D\uDE02', label: 'laugh' },
  { emoji: '\uD83E\uDD14', label: 'thinking' },
  { emoji: '\uD83D\uDE4F', label: 'pray' },
  { emoji: '\uD83D\uDE80', label: 'rocket' },
  { emoji: '\uD83D\uDC40', label: 'eyes' },
  { emoji: '\uD83C\uDF89', label: 'party' },
]
const DEFAULTS: Reaction[] = [
  { emoji: '\uD83D\uDC4D', label: 'thumbsup',
    count: 3, reacted: false },
  { emoji: '\u2764\uFE0F', label: 'heart',
    count: 1, reacted: true },
]

export function PostReactions({
  postId, initialReactions, onReact,
}: PostReactionsProps) {
  const [list, setList] =
    useState<Reaction[]>(
      initialReactions ?? DEFAULTS)
  const [anchor, setAnchor] =
    useState<null | HTMLElement>(null)

  const toggle = (em: string, lb: string) => {
    setList(prev => {
      const ex = prev.find(
        r => r.emoji === em)
      if (ex?.reacted) {
        const n = ex.count - 1
        return n <= 0
          ? prev.filter(r => r.emoji !== em)
          : prev.map(r => r.emoji === em
            ? { ...r, count: n,
                reacted: false } : r)
      }
      if (ex) return prev.map(r =>
        r.emoji === em
          ? { ...r, count: r.count + 1,
              reacted: true } : r)
      return [...prev,
        { emoji: em, label: lb,
          count: 1, reacted: true }]
    })
    onReact?.(postId, em)
    setAnchor(null)
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center',
      gap: 0.5, flexWrap: 'wrap',
    }}>
      {list.map(r => (
        <ReactionBadge key={r.label}
          emoji={r.emoji} label={r.label}
          count={r.count} reacted={r.reacted}
          onClick={() =>
            toggle(r.emoji, r.label)} />
      ))}
      <IconButton size="small"
        onClick={e =>
          setAnchor(e.currentTarget)}
        sx={{ ml: 0.5 }}
        aria-label="Add reaction"
        data-testid="add-reaction-btn">
        <AddReactionOutlined
          fontSize="small" />
      </IconButton>
      <ReactionPicker anchorEl={anchor}
        onClose={() => setAnchor(null)}
        reactions={REACTIONS}
        onPick={toggle} />
    </Box>
  )
}
