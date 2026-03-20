'use client'

import { Grid } from '@mui/material'
import { ArticleCard } from './ArticleCard'
import type {
  ArticleSummary,
} from '@/hooks/useArticles'

interface ArticleListProps {
  articles: ArticleSummary[]
  slug: string
}

export function ArticleList(
  { articles, slug }: ArticleListProps
) {
  return (
    <Grid
      container
      spacing={3}
      data-testid="article-list"
      role="list"
      aria-label="Articles"
    >
      {articles.map((article) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          key={article.name}
          role="listitem"
        >
          <ArticleCard
            article={article}
            slug={slug}
          />
        </Grid>
      ))}
    </Grid>
  )
}
