import api from '@/lib/api'

interface SaveArgs {
  name: string
  tenantId: number
  content: string
  summary: string
  tags: string[]
  renderer: string
  origRenderer: string
}

/** Persists content, then tags and renderer (best effort). */
export async function saveArticle(a: SaveArgs) {
  await api.put(`/api/articles/${a.name}`, {
    content: a.content,
    summary: a.summary || 'Updated article',
    tenant_id: a.tenantId,
  })
  await api
    .put(`/api/articles/${a.name}/tags`, {
      tags: a.tags,
      tenant_id: a.tenantId,
    })
    .catch(() => {})
  if (a.renderer !== a.origRenderer) {
    await api
      .put(`/api/articles/${a.name}/renderer`, {
        renderer: a.renderer.toLowerCase(),
        tenant_id: a.tenantId,
      })
      .catch(() => {})
  }
}
