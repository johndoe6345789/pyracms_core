import Link from 'next/link'
import { Avatar, Box, Card, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { kindOf } from '@/lib/search/kinds'
import { safeHref } from '@/lib/safeUrl'
import type { SearchHit } from '@/lib/search/types'
import Marked from './Marked'
import ResultMeta from './ResultMeta'
import ResultTags from './ResultTags'

interface Props {
  hit: SearchHit
  index: number
  slug: string
  query?: string
}

/** One search result, styled like the rest of the site. */
export default function ResultCard({ hit, index, slug, query }: Props) {
  const kind = kindOf(hit.type)
  return (
    <Card
      variant="outlined"
      component="article"
      data-testid={`search-result-${index}`}
      sx={{
        display: 'flex',
        gap: 2,
        p: 2,
        transition: 'border-color .15s, box-shadow .15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: kind.color,
        }}
      >
        {kind.icon}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h6"
          component={Link}
          href={safeHref(hit.url) ?? '#'}
          sx={{
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          <Marked text={hit.titleMarked || hit.title} />
        </Typography>
        <Box>
          <ResultMeta hit={hit} />
        </Box>
        {hit.snippet && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
            }}
          >
            <Marked text={hit.snippet} />
          </Typography>
        )}
        <ResultTags tags={hit.tags} slug={slug} query={query ?? ''} />
      </Box>
    </Card>
  )
}
