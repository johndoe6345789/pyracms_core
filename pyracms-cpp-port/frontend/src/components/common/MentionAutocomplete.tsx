'use client'

import {
  Paper, List, ListItem, ListItemText, Popper, Typography,
} from '@mui/material'
import { useMention } from './useMention'

interface Props {
  inputRef: React.RefObject<
    HTMLTextAreaElement | HTMLInputElement | null>
  onSelect: (username: string) => void
}

export function MentionAutocomplete({ inputRef, onSelect }: Props) {
  const { list, anchor, clear } = useMention(inputRef)

  if (list.length === 0 || !anchor) return null

  return (
    <Popper open anchorEl={anchor}
      placement="bottom-start"
      sx={{ zIndex: 1300 }}>
      <Paper elevation={8} sx={{
        maxWidth: 250, maxHeight: 200, overflow: 'auto' }}>
        <Typography variant="caption" sx={{
          px: 1.5, py: 0.5, display: 'block',
          color: 'text.secondary' }}>
          Mention user
        </Typography>
        <List dense>
          {list.map((u) => (
            <ListItem key={u.id}
              onClick={() => { onSelect(u.username); clear() }}
              data-testid={`mention-item-${u.id}`}
              sx={{ cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' } }}>
              <ListItemText primary={`@${u.username}`} />
            </ListItem>))}
        </List>
      </Paper>
    </Popper>
  )
}
