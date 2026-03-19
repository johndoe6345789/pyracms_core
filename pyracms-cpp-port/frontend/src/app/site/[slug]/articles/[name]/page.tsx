'use client'

import { useParams } from 'next/navigation'
import { Container, Typography, Divider } from '@mui/material'
import { useArticle } from '@/hooks/useArticle'
import { ArticleMetadata } from '@/components/articles/ArticleMetadata'
import { ArticleTagChips } from '@/components/articles/ArticleTagChips'
import { ArticleActions } from '@/components/articles/ArticleActions'
import { ArticleContent } from '@/components/articles/ArticleContent'
import { ArticleVoteButtons } from '@/components/articles/ArticleVoteButtons'

export default function ViewArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { article } = useArticle(name)

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" gutterBottom>{article.title}</Typography>
      <ArticleMetadata author={article.author} date={article.createdDate} renderer={article.renderer} views={article.views} />
      <ArticleTagChips tags={article.tags} color="primary" />
      <ArticleActions slug={slug} name={name} revisionNumber={article.revisionNumber} />
      <Divider sx={{ mb: 4 }} />
      <ArticleContent html={article.content} />
      <Divider sx={{ mb: 3 }} />
      <ArticleVoteButtons likes={article.likes} dislikes={article.dislikes} />
    </Container>
  )
}
