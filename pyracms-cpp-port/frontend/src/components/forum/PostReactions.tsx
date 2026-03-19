'use client'

import { useState } from 'react'
import { Box, IconButton, Typography, Popover, Tooltip } from '@mui/material'
import { AddReactionOutlined } from '@mui/icons-material'

interface Reaction {
  emoji: string
  label: string
  count: number
  reacted: boolean
}

interface PostReactionsProps {
  postId: string
  initialReactions?: Reaction[]
  onReact?: (postId: string, emoji: string) => void
}

const AVAILABLE_REACTIONS = [
  { emoji: '\uD83D\uDC4D', label: 'thumbsup' },
  { emoji: '\u2764\uFE0F', label: 'heart' },
  { emoji: '\uD83D\uDE02', label: 'laugh' },
  { emoji: '\uD83E\uDD14', label: 'thinking' },
  { emoji: '\uD83D\uDE4F', label: 'pray' },
  { emoji: '\uD83D\uDE80', label: 'rocket' },
  { emoji: '\uD83D\uDC40', label: 'eyes' },
  { emoji: '\uD83C\uDF89', label: 'party' },
]

const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: '\uD83D\uDC4D', label: 'thumbsup', count: 3, reacted: false },
  { emoji: '\u2764\uFE0F', label: 'heart', count: 1, reacted: true },
]

export function PostReactions({ postId, initialReactions, onReact }: PostReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions ?? DEFAULT_REACTIONS)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleToggleReaction = (emoji: string, label: string) => {
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji)
      if (existing) {
        if (existing.reacted) {
          const newCount = existing.count - 1
          return newCount <= 0
            ? prev.filter((r) => r.emoji !== emoji)
            : prev.map((r) => r.emoji === emoji ? { ...r, count: newCount, reacted: false } : r)
        }
        return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, reacted: true } : r)
      }
      return [...prev, { emoji, label, count: 1, reacted: true }]
    })
    onReact?.(postId, emoji)
    setAnchorEl(null)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      {reactions.map((reaction) => (
        <Tooltip key={reaction.label} title={reaction.label}>
          <Box
            onClick={() => handleToggleReaction(reaction.emoji, reaction.label)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 3,
              border: 1,
              borderColor: reaction.reacted ? 'primary.main' : 'divider',
              bgcolor: reaction.reacted ? 'primary.main' + '14' : 'transparent',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              transition: 'all 0.15s ease',
            }}
          >
            <Typography variant="body2" component="span">{reaction.emoji}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, color: reaction.reacted ? 'primary.main' : 'text.secondary' }}>
              {reaction.count}
            </Typography>
          </Box>
        </Tooltip>
      ))}

      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
        <AddReactionOutlined fontSize="small" />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, p: 1 }}>
          {AVAILABLE_REACTIONS.map((r) => (
            <IconButton
              key={r.label}
              size="small"
              onClick={() => handleToggleReaction(r.emoji, r.label)}
              title={r.label}
            >
              <Typography variant="body1">{r.emoji}</Typography>
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  )
}
