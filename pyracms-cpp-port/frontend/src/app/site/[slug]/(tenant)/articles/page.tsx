'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Container } from '@mui/material'
import { useArticles } from '@/hooks/useArticles'
import { useTenantId } from '@/hooks/useTenantId'
import { ArticleSearchBar } from '@/components/articles/ArticleSearchBar'
import { ArticleList } from '@/components/articles/ArticleList'
import { ActiveTagBanner } from '@/components/articles/ActiveTagBanner'
import ArticleListHeader from './ArticleListHeader'

export default function ArticleListPage() {
  const params = useParams()
  const slug = params.slug as string
  const { tenantId } = useTenantId(slug)
  const tag = useSearchParams()?.get('tag') ?? ''
  const { articles, searchQuery, setSearchQuery } = useArticles(tenantId, tag)

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} data-testid="article-list-page">
      <ArticleListHeader slug={slug} />
      <ActiveTagBanner slug={slug} tag={tag} />
      <section aria-label="Article search">
        <ArticleSearchBar value={searchQuery} onChange={setSearchQuery} />
      </section>
      <section aria-label="Article listing">
        <ArticleList articles={articles} slug={slug} />
      </section>
    </Container>
  )
}
