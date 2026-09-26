import api from '@/lib/api'

export interface ArticleRow {
  name: string
  displayName: string
  content: string
  renderer: string
  status: string
  isPrivate: boolean
  tags: string[]
}

export type Raw = Record<string, unknown>

/** The article as the site has it now, or null when there is none. */
export const findArticle = (name: string, tenantId: number) =>
  api
    .get(`/api/articles/${encodeURIComponent(name)}`, {
      params: { tenant_id: tenantId },
    })
    .then((r) => r.data as Raw)
    .catch(() => null)

/** Creates or brings one article in line; true when it was created. */
export async function restoreArticle(r: ArticleRow, tenantId: number) {
  const url = `/api/articles/${encodeURIComponent(r.name)}`
  const body = { tenant_id: tenantId }
  const old = await findArticle(r.name, tenantId)
  if (!old) {
    await api.post('/api/articles', { ...r, ...body })
  } else {
    if (old.content !== r.content)
      await api.put(url, { ...body, content: r.content })
    if (old.rendererName !== r.renderer)
      await api.put(`${url}/renderer`, { ...body, renderer: r.renderer })
  }
  if (old ? (old.isPrivate === true) !== r.isPrivate : r.isPrivate)
    await api.put(`${url}/private`, body)
  const now = (old?.status as string) ?? 'published'
  if (r.status !== now && ['published', 'draft'].includes(r.status))
    await api.post(
      `${url}/${r.status === 'published' ? 'publish' : 'unpublish'}`,
      body,
    )
  await api.put(`${url}/tags`, { ...body, tags: r.tags })
  return !old
}
