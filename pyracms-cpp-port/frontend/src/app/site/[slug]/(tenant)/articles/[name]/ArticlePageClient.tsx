'use client'

import { useParams } from 'next/navigation'
import { Container, Divider } from '@mui/material'
import { useArticle } from '@/hooks/useArticle'
import { useTenantId } from '@/hooks/useTenantId'
import {
  ArticleContent,
} from '@/components/articles/ArticleContent'
import {
  ArticleVoteButtons,
} from '@/components/articles/ArticleVoteButtons'
import PageTransition from '@/components/common/PageTransition'
import ArticleHeader from './ArticleHeader'

export default function ArticlePageClient() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const { article, handleVote } = useArticle(name, tenantId)

  if (!article) return null

  return (
    <PageTransition>
      <Container
        maxWidth="md"
        sx={{ py: 6 }}
        data-testid="article-detail-page"
      >
        <article
          aria-label={article.title}
          data-testid="article-content-wrapper"
        >
          <ArticleHeader article={article} slug={slug} name={name} />
          <Divider sx={{ mb: 4 }} />
          <section aria-label="Article body">
            <ArticleContent
              content={article.content}
              renderer={article.renderer}
            />
          </section>
          <Divider sx={{ mb: 3 }} />
          <section aria-label="Article voting">
            <ArticleVoteButtons
              likes={article.likes}
              dislikes={article.dislikes}
              onVote={handleVote}
            />
          </section>
        </article>
      </Container>
    </PageTransition>
  )
}
