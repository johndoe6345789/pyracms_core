'use client'

import { useParams } from 'next/navigation'
import {
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material'
import { AddOutlined } from '@mui/icons-material'
import Link from 'next/link'
import { useArticles } from '@/hooks/useArticles'
import { useTenantId } from '@/hooks/useTenantId'
import {
  ArticleSearchBar,
} from '@/components/articles/ArticleSearchBar'
import {
  ArticleList,
} from '@/components/articles/ArticleList'

export default function ArticleListPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const {
    articles,
    searchQuery,
    setSearchQuery,
  } = useArticles(tenantId)

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6 }}
      data-testid="article-list-page"
    >
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
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
            >
              Articles
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
            >
              Browse articles, tutorials, and
              blog posts published on this site.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            component={Link}
            href={
              `/site/${slug}/articles/create`
            }
            data-testid="create-article-btn"
            aria-label="Create new article"
          >
            Create Article
          </Button>
        </Box>
      </section>
      <section aria-label="Article search">
        <ArticleSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </section>
      <section aria-label="Article listing">
        <ArticleList
          articles={articles}
          slug={slug}
        />
      </section>
    </Container>
  )
}
