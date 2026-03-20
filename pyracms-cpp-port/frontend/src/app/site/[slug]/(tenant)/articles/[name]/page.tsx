import type { Metadata } from 'next'
import { generateArticleMetadata, fetchArticleJsonLd } from '@/lib/metadata'
import JsonLd from '@/components/common/JsonLd'
import ArticlePageClient from './ArticlePageClient'

interface Props {
  params: Promise<{ slug: string; name: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, name } = await params
  return generateArticleMetadata(slug, name)
}

export default async function ViewArticlePage({ params }: Props) {
  const { slug, name } = await params
  const jsonLd = await fetchArticleJsonLd(slug, name)

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <ArticlePageClient />
    </>
  )
}
