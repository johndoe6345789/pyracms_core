import { Typography } from '@mui/material'
import {
  ArticleMetadata,
} from '@/components/articles/ArticleMetadata'
import {
  ArticleTagChips,
} from '@/components/articles/ArticleTagChips'
import {
  ArticleActions,
} from '@/components/articles/ArticleActions'
import type { Article } from '@/hooks/useArticle'

export default function ArticleHeader({
  article,
  slug,
  name,
}: {
  article: Article
  slug: string
  name: string
}) {
  return (
    <section aria-label="Article header">
      <Typography variant="h2" component="h1" gutterBottom>
        {article.title}
      </Typography>
      <ArticleMetadata
        author={article.author}
        date={article.createdDate}
        renderer={article.renderer}
        views={article.views}
      />
      <ArticleTagChips
        tags={article.tags}
        color="primary"
        searchSlug={slug}
      />
      <ArticleActions
        slug={slug}
        name={name}
        revisionCount={article.revisionCount}
      />
    </section>
  )
}
