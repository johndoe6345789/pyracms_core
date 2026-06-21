'use client'

import Link from 'next/link'
import {
  Box,
  Chip,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import { LocalOfferOutlined } from '@mui/icons-material'
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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
            aria-label="Tag cloud"
          >
            {items.map((tag) => (
              <Chip
                key={tag.name}
                component={Link}
                href={tag.href}
                clickable
                icon={<LocalOfferOutlined />}
                label={`${tag.name} (${tag.count})`}
                data-testid={`tag-cloud-chip-${tag.name}`}
                sx={{
                  fontSize: tag.fontSize,
                  height: tag.height,
                  borderColor: 'primary.light',
                  bgcolor: 'primary.50',
                  '& .MuiChip-label': { px: 1.25 },
                }}
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  )
}
