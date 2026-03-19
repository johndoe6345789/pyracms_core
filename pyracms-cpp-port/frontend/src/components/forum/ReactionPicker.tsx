'use client'

import {
  Box, IconButton, Typography, Popover,
} from '@mui/material'

interface ReactionOption {
  emoji: string
  label: string
}

interface ReactionPickerProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  reactions: ReactionOption[]
  onPick: (emoji: string, label: string) => void
}

export function ReactionPicker({
  anchorEl, onClose, reactions, onPick,
}: ReactionPickerProps) {
  return (
    <Popover open={Boolean(anchorEl)}
      anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center' }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center' }}>
      <Box sx={{
        display: 'flex', gap: 0.5, p: 1,
      }}>
        {reactions.map(r => (
          <IconButton key={r.label}
            size="small" aria-label={r.label}
            onClick={() =>
              onPick(r.emoji, r.label)}
            data-testid={
              `reaction-pick-${r.label}`}>
            <Typography variant="body1">
              {r.emoji}
            </Typography>
          </IconButton>
        ))}
      </Box>
    </Popover>
  )
}
