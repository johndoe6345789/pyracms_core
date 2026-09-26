import Link from 'next/link'
import { Box, Chip } from '@mui/material'

interface Props {
  tags: string[]
  slug: string
  /** the searched words; tags that match them stand out */
  query?: string
}

/** A result's tags, each a link to that tag's page. */
export default function ResultTags({ tags, slug, query = '' }: Props) {
  if (tags.length === 0) return null
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  return (
    <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {tags.slice(0, 6).map((t) => (
        <Chip
          key={t}
          size="small"
          variant={words.includes(t) ? 'filled' : 'outlined'}
          color={words.includes(t) ? 'primary' : 'default'}
          label={t}
          component={Link}
          href={`/site/${slug}/tags/${encodeURIComponent(t)}`}
          clickable
        />
      ))}
    </Box>
  )
}
