'use client'

import { Box, Container, Paper, Typography } from '@mui/material'
import TagCloudChips from '@/components/gallery/TagCloudChips'
import { useTagCloudPage } from '@/hooks/useTagCloudPage'

export default function TagCloudPage() {
  const { items, loading } = useTagCloudPage()

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
      data-testid="tag-cloud-page"
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tags
        </Typography>
        <Typography color="text.secondary">
          Browse article topics by tag.
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 1,
          minHeight: 180,
          display: 'grid',
          placeItems: items.length ? 'start' : 'center',
        }}
      >
        {loading ? (
          <Typography color="text.secondary" role="status">
            Loading tags...
          </Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">
            No tags yet.
          </Typography>
        ) : (
          <TagCloudChips items={items} />
        )}
      </Paper>
    </Container>
  )
}
