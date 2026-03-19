'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import { NavigateNextOutlined } from '@mui/icons-material'
import CodeSnippet from '@/components/code/CodeSnippet'
import { useCodeAlbum } from '@/hooks/useCodeAlbum'
import { useTenantId } from '@/hooks/useTenantId'

export default function CodeAlbumViewPage() {
  const params = useParams()
  const slug = params.slug as string
  const albumId = params.albumId as string
  const { tenantId } = useTenantId(slug)
  const { albumName, snippets, handleRun } = useCodeAlbum(albumId, tenantId)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Breadcrumbs
        separator={<NavigateNextOutlined fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link href={`/site/${slug}/code`} style={{ color: 'inherit', textDecoration: 'none' }}>
          Code Snippets
        </Link>
        <Typography color="text.primary">{albumName}</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom>
        {albumName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {snippets.length} code snippets in this collection.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {snippets.map((snippet) => (
          <CodeSnippet key={snippet.id} snippet={snippet} onRun={handleRun} />
        ))}
      </Box>
    </Container>
  )
}
