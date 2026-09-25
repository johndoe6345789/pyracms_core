'use client'

import { Box, Chip } from '@mui/material'
import Link from 'next/link'

function tagHref(slug: string, tag: string) {
  return `/site/${slug}/tags/${encodeURIComponent(tag)}`
}

interface ArticleTagChipsProps {
  tags: string[]
  color?: 'default' | 'primary'
  searchSlug?: string
}

export function ArticleTagChips({
  tags,
  color = 'default',
  searchSlug,
}: ArticleTagChipsProps) {
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
          href={searchSlug ? tagHref(searchSlug, tag) : undefined}
          clickable={Boolean(searchSlug)}
          label={tag}
          size="small"
          variant="outlined"
          color={color}
          role="listitem"
          data-testid={`tag-chip-${tag}`}
        />
      ))}
    </Box>
  )
}
