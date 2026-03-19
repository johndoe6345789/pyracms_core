'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Grid } from '@mui/material'
import CodeAlbumCard from '@/components/code/CodeAlbumCard'
import { useCodeAlbums } from '@/hooks/useCodeAlbums'

export default function CodeAlbumListPage() {
  const params = useParams()
  const slug = params.slug as string
  const { albums } = useCodeAlbums()

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Code Snippets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse collections of code snippets organized by topic.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={4} key={album.id}>
            <CodeAlbumCard album={album} slug={slug} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
