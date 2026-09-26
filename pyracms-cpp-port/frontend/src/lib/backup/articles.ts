import { fetchAllPages, attempt } from './pages'
import { emptyOutcome, type SectionDef } from './types'
import {
  findArticle,
  restoreArticle,
  type ArticleRow,
  type Raw,
} from './articleRestore'

const listArticles = (tenantId: number) =>
  fetchAllPages<Raw>('/api/articles', { tenant_id: tenantId }, (d) =>
    Array.isArray(d) ? d : [],
  )

export const articlesSection: SectionDef = {
  key: 'articles',
  label: 'Articles',
  description: 'Article text, renderer, tags, privacy and published state.',
  async collect(tenantId, progress) {
    const rows: ArticleRow[] = []
    for (const a of await listArticles(tenantId)) {
      progress(`Article ${a.displayName}`)
      const d = await findArticle(a.name as string, tenantId)
      if (!d) continue
      rows.push({
        name: d.name as string,
        displayName: d.displayName as string,
        content: d.content as string,
        renderer: d.rendererName as string,
        status: d.status as string,
        isPrivate: d.isPrivate === true,
        tags: (d.tags as string[]) ?? [],
      })
    }
    return rows
  },
  async restore(rows, tenantId, progress) {
    const out = emptyOutcome()
    for (const r of rows as ArticleRow[]) {
      progress(`Article ${r.displayName}`)
      await attempt(out.failed, r.name, async () => {
        if (await restoreArticle(r, tenantId)) out.created++
        else out.updated++
      })
    }
    return out
  },
}
