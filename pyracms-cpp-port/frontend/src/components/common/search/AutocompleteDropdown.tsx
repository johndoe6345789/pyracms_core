'use client'

import {
  Paper, List, ListItem, ListItemIcon,
  ListItemText, Popper, Chip,
} from '@mui/material'
import {
  SearchOutlined, ArticleOutlined,
  ForumOutlined, CodeOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material'

interface Result {
  text: string; type: string; url: string
}
const ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  forum_post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  gamedep: (
    <SportsEsportsOutlined fontSize="small" />),
}
interface Props {
  open: boolean
  anchorEl: HTMLElement | null
  results: Result[]
  width?: number
  onSelect: (r: Result) => void
}
export default function AutocompleteDropdown({
  open, anchorEl, results, width, onSelect,
}: Props) {
  return (
    <Popper open={open} anchorEl={anchorEl}
      placement="bottom-start"
      sx={{ zIndex: 1300, width }}>
      <Paper elevation={8} sx={{
        maxHeight: 300, overflow: 'auto' }}>
        <List dense>
          {results.map((r, i) => (
            <ListItem key={i}
              onClick={() => onSelect(r)}
              data-testid={
                `autocomplete-item-${i}`}
              sx={{ cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover' } }}>
              <ListItemIcon
                sx={{ minWidth: 32 }}>
                {ICONS[r.type] || (
                  <SearchOutlined
                    fontSize="small" />)}
              </ListItemIcon>
              <ListItemText primary={r.text} />
              <Chip label={r.type} size="small"
                sx={{ height: 20,
                  fontSize: '0.6rem' }} />
            </ListItem>))}
        </List>
      </Paper>
    </Popper>)
}
