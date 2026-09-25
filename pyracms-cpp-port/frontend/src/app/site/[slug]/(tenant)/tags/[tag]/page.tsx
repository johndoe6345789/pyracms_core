'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Box, Container, List, ListItemButton, Typography } from '@mui/material'
import { BackButton } from '@/components/common/BackButton'
import { useTagContent } from '@/hooks/useTagContent'
import { useTenantId } from '@/hooks/useTenantId'

export default function TagPage() {
  const params = useParams()
  const slug = params.slug as string
  const tag = decodeURIComponent(params.tag as string)
  const { tenantId } = useTenantId(slug)
  const { articles, snippets, loading } = useTagContent(tenantId, tag)
  const empty = !loading && !articles.length && !snippets.length

  return (
    <Container maxWidth="md" sx={{ py: 6 }} data-testid="tag-page">
      <BackButton href={`/site/${slug}/tags`} label="All tags" />
      <Typography variant="h3" component="h1" sx={{ my: 2 }}>
        Tagged: {tag}
      </Typography>
      {empty && (
        <Typography color="text.secondary">
          Nothing carries this tag.
        </Typography>
      )}
      {articles.length > 0 && (
        <Box sx={{ mb: 3 }} data-testid="tag-articles">
          <Typography variant="h5">Articles ({articles.length})</Typography>
          <List dense>
            {articles.map((a) => (
              <ListItemButton
                key={a.name}
                component={Link}
                href={`/site/${slug}/articles/${encodeURIComponent(a.name)}`}
              >
                {a.title}
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
      {snippets.length > 0 && (
        <Box data-testid="tag-snippets">
          <Typography variant="h5">Snippets ({snippets.length})</Typography>
          <List dense>
            {snippets.map((s) => (
              <ListItemButton
                key={s.id}
                component={Link}
                href={`/site/${slug}/snippets/${s.id}`}
              >
                {s.title}
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Container>
  )
}
