'use client'

import { ArticleOutlined } from '@mui/icons-material'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { type SearchResult } from '@/hooks/useSearchPage'
import {
  SearchResultTitle,
  TYPE_ICONS,
} from './SearchResultTitle'
import { highlightMatch } from './highlightMatch'

interface SearchResultRowProps {
  index: number
  last: boolean
  query: string
  result: SearchResult
}

export function SearchResultRow({
  index,
  last,
  query,
  result,
}: SearchResultRowProps) {
  return (
    <ListItem
      component="a"
      href={result.url}
      data-testid={`search-result-${index}`}
      divider={!last}
      sx={{ alignItems: 'flex-start', gap: 1, px: 0, py: 2 }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {TYPE_ICONS[result.type] || <ArticleOutlined />}
      </ListItemIcon>
      <ListItemText
        primary={<SearchResultTitle result={result} />}
        secondary={(
          <Typography
            variant="body2"
            component="span"
            dangerouslySetInnerHTML={{
              __html: highlightMatch(result.snippet || '', query),
            }}
          />
        )}
      />
    </ListItem>
  )
}
