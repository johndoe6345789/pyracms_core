import { Typography, Box, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'

export default function ArticleListHeader({
  slug,
}: {
  slug: string
}) {
  return (
    <section aria-label="Article list header">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Articles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse articles, tutorials, and blog posts published
            on this site.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          component={Link}
          href={`/site/${slug}/articles/create`}
          data-testid="create-article-btn"
          aria-label="Create new article"
        >
          Create Article
        </Button>
      </Box>
    </section>
  )
}
