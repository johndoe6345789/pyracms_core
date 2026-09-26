import Link from 'next/link'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import { useTagCloudPage } from '@/hooks/useTagCloudPage'

const SECTIONS = [
  ['Articles', 'articles'],
  ['Photo galleries', 'gallery'],
  ['Code snippets', 'snippets'],
  ['Forum', 'forum'],
  ['All tags', 'tags'],
]

interface Props {
  slug: string
  /** the words that found nothing, when this is a "no results" page */
  missed?: string
}

/** No query yet, or nothing found: ways to find something anyway. */
export default function SearchLanding({ slug, missed }: Props) {
  const { items } = useTagCloudPage()
  const top = [...items].sort((a, b) => b.count - a.count).slice(0, 14)
  return (
    <Paper variant="outlined" sx={{ p: 3 }} data-testid="search-landing">
      <Typography variant="h6" component="h2" gutterBottom>
        {missed ? `Nothing found for "${missed}"` : 'What are you looking for?'}
      </Typography>
      {missed && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Check the spelling, try fewer or more general words, or look through
          the site instead.
        </Typography>
      )}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {SECTIONS.map(([label, path]) => (
          <Button
            key={path}
            component={Link}
            href={`/site/${slug}/${path}`}
            variant="outlined"
            size="small"
          >
            {label}
          </Button>
        ))}
      </Stack>
      {top.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Popular tags
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            {top.map((t) => (
              <Chip
                key={t.name}
                label={t.name}
                component={Link}
                href={t.href}
                clickable
              />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  )
}
