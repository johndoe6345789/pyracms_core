'use client'

import {
  Box, Typography, Chip,
  ListItem, ListItemText,
} from '@mui/material'
import DOMPurify from 'dompurify'
import type { ForumSearchResult } from
  './SearchResults'

interface SearchResultItemProps {
  result: ForumSearchResult
  query: string
  showDivider: boolean
  onClick?: (r: ForumSearchResult) => void
}

/**
 * Highlights query matches in text.
 * All output is sanitized through DOMPurify
 * before rendering to prevent XSS.
 */
function highlightMatch(
  text: string, hl: string
): string {
  if (!hl) return DOMPurify.sanitize(text)
  const esc = hl.replace(
    /[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${esc})`, 'gi')
  const replaced = text.replace(
    re, '<mark>$1</mark>')
  return DOMPurify.sanitize(replaced)
}

export function SearchResultItem({
  result, query, showDivider, onClick,
}: SearchResultItemProps) {
  const snippet = result.postContent
    .substring(0, 200)
  const sanitizedHtml = highlightMatch(
    snippet, query)
  return (
    <ListItem
      divider={showDivider}
      data-testid={`search-result-${result.id}`}
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={() => onClick?.(result)}>
      <ListItemText
        primary={
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1, mb: 0.5,
          }}>
            <Typography variant="subtitle2"
              sx={{ fontWeight: 600 }}>
              {result.threadTitle}
            </Typography>
            {result.forumName && (
              <Chip label={result.forumName}
                size="small"
                variant="outlined" />
            )}
          </Box>
        }
        secondary={
          <Box component="span">
            <Typography variant="body2"
              component="span"
              dangerouslySetInnerHTML={{
                __html: sanitizedHtml,
              }} />
            <Typography variant="caption"
              display="block"
              color="text.secondary"
              sx={{ mt: 0.5 }}>
              by {result.author}
              {' '}on {result.date}
            </Typography>
          </Box>
        } />
    </ListItem>
  )
}
