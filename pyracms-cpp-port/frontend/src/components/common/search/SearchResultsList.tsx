'use client'

import {
  Box, Typography, List, ListItem,
  ListItemIcon, ListItemText,
} from '@mui/material'
import {
  ArticleOutlined, ForumOutlined,
  CodeOutlined, PersonOutlined,
} from '@mui/icons-material'

export interface SearchResult {
  id: string
  type: 'article' | 'post' | 'snippet' | 'user'
  title: string; snippet: string; url: string
}
const ICONS: Record<string, React.ReactNode> = {
  article: <ArticleOutlined fontSize="small" />,
  post: <ForumOutlined fontSize="small" />,
  snippet: <CodeOutlined fontSize="small" />,
  user: <PersonOutlined fontSize="small" />,
}
const COLORS: Record<string, string> = {
  article: '#1976d2', post: '#ed6c02',
  snippet: '#2e7d32', user: '#9c27b0',
}

interface Props {
  results: SearchResult[]; query: string
  onSelect: (r: SearchResult) => void
}
export default function SearchResultsList({
  results, query, onSelect,
}: Props) {
  if (results.length === 0 && query.length >= 2)
    return (
      <Box sx={{ p: 3, textAlign: 'center',
        borderTop: 1, borderColor: 'divider' }}>
        <Typography color="text.secondary">
          No results for &quot;{query}&quot;
        </Typography></Box>)
  if (results.length === 0) return null
  const grp = results.reduce<
    Record<string, SearchResult[]>
  >((a, r) => {
    ;(a[r.type] ??= []).push(r); return a
  }, {})
  return (
    <Box sx={{ borderTop: 1,
      borderColor: 'divider',
      maxHeight: 400, overflow: 'auto' }}>
      {Object.entries(grp).map(([t, items]) => (
        <Box key={t}>
          <Typography variant="caption" sx={{
            px: 2, py: 0.5, display: 'block',
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontWeight: 600,
            bgcolor: 'background.default' }}>
            {t}s</Typography>
          <List disablePadding>
            {items.map((r) => (
              <ListItem key={r.id}
                onClick={() => onSelect(r)}
                data-testid={
                  `search-result-${r.id}`}
                sx={{ cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover' },
                  px: 2, py: 1 }}>
                <ListItemIcon sx={{
                  minWidth: 36,
                  color: COLORS[r.type] }}>
                  {ICONS[r.type]}</ListItemIcon>
                <ListItemText
                  primary={r.title}
                  secondary={
                    r.snippet.substring(0, 80)
                    + (r.snippet.length > 80
                      ? '...' : '')}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 600 }}
                  secondaryTypographyProps={{
                    variant: 'caption' }} />
              </ListItem>))}
          </List>
        </Box>))}
    </Box>)
}
