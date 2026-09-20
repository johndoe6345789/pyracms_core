import Link from 'next/link'
import { Box, Chip } from '@mui/material'
import { LocalOfferOutlined } from '@mui/icons-material'

/** Shows which tag the article list is narrowed to, with a way out. */
export function ActiveTagBanner({ slug, tag }: { slug: string; tag: string }) {
  if (!tag) return null
  return (
    <Box sx={{ mb: 3 }} data-testid="active-tag">
      <Chip
        color="primary"
        icon={<LocalOfferOutlined />}
        label={`Tagged: ${tag}`}
        component={Link}
        href={`/site/${slug}/articles`}
        clickable
        aria-label={`Showing articles tagged ${tag}. Show all articles`}
      />
    </Box>
  )
}
