'use client'

import { ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material'
import {
  SearchOutlined,
  ArticleOutlined,
  ForumOutlined,
  CodeOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'

export interface Result {
  text: string
  type: string
  url: string
}
const ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  forum_post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  gamedep: <SportsEsportsOutlined fontSize="small" />,
}
interface Props {
  r: Result
  i: number
  onSelect: (r: Result) => void
}
export default function AutocompleteItem({ r, i, onSelect }: Props) {
  return (
    <ListItem
      onClick={() => onSelect(r)}
      data-testid={`autocomplete-item-${i}`}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 32 }}>
        {ICONS[r.type] || <SearchOutlined fontSize="small" />}
      </ListItemIcon>
      <ListItemText primary={r.text} />
      <Chip
        label={r.type}
        size="small"
        sx={{ height: 20, fontSize: '0.6rem' }}
      />
    </ListItem>
  )
}
