import api from '@/lib/api'
import { attempt, fetchAllPages } from './pages'
import {
  restoreSnippet,
  type Listed,
  type SnippetRow as Row,
} from './snippetRestore'
import { emptyOutcome, type SectionDef } from './types'

const listSnippets = (tenantId: number) =>
  fetchAllPages<Listed>(
    '/api/snippets',
    { tenant_id: tenantId },
    (d) => (d as { items: Listed[] }).items ?? [],
  )

export const snippetsSection: SectionDef = {
  key: 'snippets',
  label: 'Code snippets',
  description: 'Code, language, visibility and tags of every snippet.',
  async collect(tenantId, progress) {
    const rows: Row[] = []
    for (const s of await listSnippets(tenantId)) {
      progress(`Snippet ${s.title}`)
      const { data } = await api.get(`/api/snippets/${s.id}`)
      rows.push({
        title: data.title,
        code: data.code,
        language: data.language,
        visibility: data.visibility,
        tags: data.tags ?? [],
      })
    }
    return rows
  },
  async restore(rows, tenantId, progress) {
    const out = emptyOutcome()
    const have = await listSnippets(tenantId)
    for (const r of rows as Row[]) {
      progress(`Snippet ${r.title}`)
      const old = have.find(
        (s) => s.title === r.title && s.language === r.language,
      )
      await attempt(out.failed, r.title, async () => {
        const did = await restoreSnippet(r, old, tenantId)
        out[did === 'unchanged' ? 'skipped' : did]++
      })
    }
    return out
  },
}
