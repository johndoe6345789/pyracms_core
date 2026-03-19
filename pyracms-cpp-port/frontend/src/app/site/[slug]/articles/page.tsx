'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Box, Button } from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useArticles } from '@/hooks/useArticles'
import { ArticleSearchBar } from '@/components/articles/ArticleSearchBar'
import { ArticleList } from '@/components/articles/ArticleList'

export default function ArticleListPage() {
  const params = useParams()
  const slug = params.slug as string
  const { articles, searchQuery, setSearchQuery } = useArticles()

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>Articles</Typography>
          <Typography variant="body1" color="text.secondary">
            Browse articles, tutorials, and blog posts published on this site.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} component={Link} href={`/site/${slug}/articles/create`}>
          Create Article
        </Button>
      </Box>
      <ArticleSearchBar value={searchQuery} onChange={setSearchQuery} />
      <ArticleList articles={articles} slug={slug} />
    </Container>
  )
}
