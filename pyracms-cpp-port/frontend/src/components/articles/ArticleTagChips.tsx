'use client'

import { Box, Chip } from '@mui/material'
import Link from 'next/link'

function searchHref(searchSlug: string, tag: string) {
  const params = new URLSearchParams({
    site: searchSlug,
    q: tag,
  })
  return `/search?${params.toString()}`
}

interface ArticleTagChipsProps {
  tags: string[]
  color?: 'default' | 'primary'
  searchSlug?: string
}

export function ArticleTagChips(
  {
    tags,
    color = 'default',
    searchSlug,
  }: ArticleTagChipsProps
) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        mb: 2,
      }}
      data-testid="article-tag-chips"
      role="list"
      aria-label="Article tags"
    >
      {tags.map((tag) => (
        <Chip
          key={tag}
          component={searchSlug ? Link : 'div'}
          href={searchSlug ? searchHref(searchSlug, tag) : undefined}
          clickable={Boolean(searchSlug)}
          label={tag}
          size="small"
          variant="outlined"
          color={color}
          role="listitem"
          data-testid={
            `tag-chip-${tag}`
          }
        />
      ))}
    </Box>
  )
}
