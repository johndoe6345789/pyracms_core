'use client'

import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Marked from '@/components/search/Marked'
import { kindOf } from '@/lib/search/kinds'
import type { Suggestion } from '@/lib/search/types'

interface Props {
  r: Suggestion
  index: number
  active: boolean
  onSelect: (r: Suggestion) => void
}

/** One suggestion in the quick-search dialog. */
export default function SearchResultRow({ r, index, active, onSelect }: Props) {
  const kind = kindOf(r.type)
  return (
    <ListItemButton
      selected={active}
      onClick={() => onSelect(r)}
      data-testid={`search-result-${index}`}
      sx={{ px: 2, py: 1, alignItems: 'flex-start' }}
    >
      <ListItemIcon sx={{ minWidth: 36, mt: 0.5, color: kind.color }}>
        {kind.icon}
      </ListItemIcon>
      <ListItemText
        primary={r.title}
        secondary={r.snippet ? <Marked text={r.snippet} /> : kind.label}
        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
        secondaryTypographyProps={{
          variant: 'caption',
          sx: {
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          },
        }}
      />
    </ListItemButton>
  )
}
