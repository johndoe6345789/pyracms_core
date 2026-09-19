'use client'

import { Card, CardContent, CardActionArea, Typography } from '@mui/material'
import Link from 'next/link'
import { ArticleTagChips } from './ArticleTagChips'
import { ArticleCardMeta } from './ArticleCardMeta'
import { cardSx, actionSx, titleSx, excerptSx } from './articleCardStyles'
import type { ArticleSummary } from '@/hooks/useArticles'

interface ArticleCardProps {
  article: ArticleSummary
  slug: string
}

export function ArticleCard({ article, slug }: ArticleCardProps) {
  return (
    <Card
      variant="outlined"
      data-testid={`article-card-${article.name}`}
      sx={cardSx}
    >
      <CardActionArea
        component={Link}
        href={`/site/${slug}/articles/${article.name}`}
        data-testid={`article-card-link-${article.name}`}
        sx={actionSx}
      >
        <CardContent sx={{ p: 3, width: '100%' }}>
          <Typography variant="h5" component="h2" gutterBottom sx={titleSx}>
            {article.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={excerptSx}>
            {article.excerpt}
          </Typography>
          <ArticleTagChips tags={article.tags} />
          <ArticleCardMeta
            author={article.author}
            date={article.date}
            views={article.views}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
