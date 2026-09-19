'use client'

import { Box, Button, Grid, Skeleton, Typography } from '@mui/material'
import Link from 'next/link'
import { SnippetCard } from './SnippetCard'
import type { useSnippets } from '@/hooks/useSnippets'

type Props = { s: ReturnType<typeof useSnippets>; slug: string }

export function SnippetGrid({ s, slug }: Props) {
  return (
    <>
      <Grid container spacing={3}>
        {s.loading
          ? [0, 1, 2].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={240} />
              </Grid>
            ))
          : s.snippets.map((snippet) => (
              <Grid item xs={12} sm={6} md={4} key={snippet.id}>
                <SnippetCard {...snippet} siteSlug={slug} />
              </Grid>
            ))}
      </Grid>
      {!s.loading && !s.error && s.snippets.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }} data-testid="no-snippets-msg">
          <Typography color="text.secondary" gutterBottom>
            {s.total === 0
              ? 'No snippets yet. Share the first one!'
              : 'No snippets match your search.'}
          </Typography>
          {s.total === 0 && (
            <Button component={Link} href={`/site/${slug}/snippets/new`}>
              Create a snippet
            </Button>
          )}
        </Box>
      )}
    </>
  )
}
