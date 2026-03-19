'use client'

import { Card, CardContent, CardActionArea, Typography, Box } from '@mui/material'
import Link from 'next/link'
import { ArticleTagChips } from './ArticleTagChips'
import { ArticleCardMeta } from './ArticleCardMeta'
import type { ArticleSummary } from '@/hooks/useArticles'

interface ArticleCardProps {
  article: ArticleSummary
  slug: string
}

export function ArticleCard({ article, slug }: ArticleCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { borderColor: 'primary.main', boxShadow: 3, transform: 'translateY(-4px)' },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/site/${slug}/articles/${article.name}`}
        sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-start' }}
      >
        <CardContent sx={{ p: 3, width: '100%' }}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
          >
            {article.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
          >
            {article.excerpt}
          </Typography>
          <ArticleTagChips tags={article.tags} />
          <ArticleCardMeta author={article.author} date={article.date} views={article.views} />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
