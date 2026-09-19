'use client'

import { useParams, useRouter } from 'next/navigation'
import { Container, Divider } from '@mui/material'
import { useArticle } from '@/hooks/useArticle'
import { useTenantId } from '@/hooks/useTenantId'
import { useSiteSession } from '@/hooks/useSiteSession'
import ArticleOwnerActions
  from '@/components/articles/ArticleOwnerActions'
import {
  ArticleContent,
} from '@/components/articles/ArticleContent'
import {
  ArticleVoteButtons,
} from '@/components/articles/ArticleVoteButtons'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import CommentSection from '@/components/common/CommentSection'
import PageTransition from '@/components/common/PageTransition'
import ArticleHeader from './ArticleHeader'

export default function ArticlePageClient() {
  const params = useParams()
  const slug = params.slug as string
  const name = params.name as string
  const { tenantId } = useTenantId(slug)
  const { article, voteError, handleVote, refresh } =
    useArticle(name, tenantId)
  const signedIn = useSiteSession(slug)
  const router = useRouter()

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
          {signedIn && (
            <ArticleOwnerActions article={article} name={name}
              tenantId={tenantId} onChanged={refresh}
              onDeleted={() => router.push(`/site/${slug}/articles`)} />
          )}
          <Divider sx={{ mb: 4 }} />
          <section aria-label="Article body">
            <ArticleContent
              content={article.content}
              renderer={article.renderer}
            />
          </section>
          <Divider sx={{ mb: 3 }} />
          <section aria-label="Article voting">
            <ErrorAlert error={voteError} testId="article-vote-error" />
            <ArticleVoteButtons
              likes={article.likes}
              dislikes={article.dislikes}
              onVote={handleVote}
            />
          </section>
        </article>
        {article.id !== undefined && (
          <CommentSection contentType="article"
            contentId={article.id} />
        )}
      </Container>
    </PageTransition>
  )
}
