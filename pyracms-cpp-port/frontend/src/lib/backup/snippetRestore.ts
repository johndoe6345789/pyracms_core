import api from '@/lib/api'

export interface SnippetRow {
  title: string
  code: string
  language: string
  visibility: string
  tags: string[]
}

export interface Listed {
  id: number
  title: string
  language: string
}

const sameTags = (a: string[] = [], b: string[]) =>
  [...a].sort().join('\n') === [...b].sort().join('\n')

/**
 * Creates a snippet, or brings the matching one in line. Only what differs
 * is written, so a restore does not pile up identical revisions.
 * @returns 'created' | 'updated' | 'unchanged'
 */
export async function restoreSnippet(
  r: SnippetRow,
  old: Listed | undefined,
  tenantId: number,
) {
  const { tags, ...fields } = r
  const cur = old ? (await api.get(`/api/snippets/${old.id}`)).data : null
  const same = cur?.code === r.code && cur?.visibility === r.visibility
  let id = old?.id
  if (!same) {
    const body = { ...fields, tenant_id: tenantId }
    if (id) await api.put(`/api/snippets/${id}`, body)
    else id = (await api.post('/api/snippets', body)).data.id
  }
  const tagsSame = cur && sameTags(cur.tags, tags)
  if (!tagsSame) await api.put(`/api/snippets/${id}/tags`, { tags })
  if (!old) return 'created'
  return same && tagsSame ? 'unchanged' : 'updated'
}
