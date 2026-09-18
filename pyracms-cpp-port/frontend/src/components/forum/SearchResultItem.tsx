'use client'

import {
  Box, Typography, Chip, ListItem, ListItemText,
} from '@mui/material'
import type { ForumSearchResult } from './SearchResults'
import { highlightMatch } from './highlight'

interface SearchResultItemProps {
  result: ForumSearchResult
  query: string
  showDivider: boolean
  onClick?: ((r: ForumSearchResult) => void) | undefined
}

export function SearchResultItem({
  result, query, showDivider, onClick,
}: SearchResultItemProps) {
  const html = highlightMatch(result.postContent.substring(0, 200), query)
  return (
    <ListItem
      divider={showDivider}
      data-testid={`search-result-${result.id}`}
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={() => onClick?.(result)}>
      <ListItemText
        primary={
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1, mb: 0.5,
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {result.threadTitle}
            </Typography>
            {result.forumName && (
              <Chip label={result.forumName} size="small"
                variant="outlined" />
            )}
          </Box>
        }
        secondary={
          <Box component="span">
            <Typography variant="body2" component="span"
              dangerouslySetInnerHTML={{ __html: html }} />
            <Typography variant="caption" display="block"
              color="text.secondary" sx={{ mt: 0.5 }}>
              by {result.author} on {result.date}
            </Typography>
          </Box>
        } />
    </ListItem>
  )
}
