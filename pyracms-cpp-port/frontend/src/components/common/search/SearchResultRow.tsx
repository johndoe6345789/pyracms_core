'use client'

import { ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { ICONS, COLORS, type SearchResult } from './searchIcons'

interface Props {
  r: SearchResult
  onSelect: (r: SearchResult) => void
}

export default function SearchResultRow({ r, onSelect }: Props) {
  return (
    <ListItem
      onClick={() => onSelect(r)}
      data-testid={`search-result-${r.id}`}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
        px: 2,
        py: 1,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 36,
          color: COLORS[r.type],
        }}
      >
        {ICONS[r.type]}
      </ListItemIcon>
      <ListItemText
        primary={r.title}
        secondary={
          r.snippet.substring(0, 80) + (r.snippet.length > 80 ? '...' : '')
        }
        primaryTypographyProps={{
          variant: 'body2',
          fontWeight: 600,
        }}
        secondaryTypographyProps={{
          variant: 'caption',
        }}
      />
    </ListItem>
  )
}
