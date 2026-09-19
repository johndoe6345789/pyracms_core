import api from '@/lib/api'

export interface ForumDialog {
  kind: 'category' | 'forum'
  mode: 'create' | 'edit' | 'delete'
  id?: string
  parentId?: string
  name?: string
  description?: string
}

/** Perform the create/edit/delete request described by a dialog. */
export function forumAdminRequest(
  d: ForumDialog, tenantId: number, name: string, description: string,
): Promise<unknown> {
  const base = d.kind === 'category'
    ? '/api/forum/categories' : '/api/forum/forums'
  if (d.mode === 'delete') return api.delete(`${base}/${d.id}`)
  if (d.kind === 'category') {
    return d.mode === 'create'
      ? api.post(base, { name, tenantId })
      : api.put(`${base}/${d.id}`, { name })
  }
  return d.mode === 'create'
    ? api.post(base, {
      name, description, categoryId: Number(d.parentId),
    })
    : api.put(`${base}/${d.id}`, { name, description })
}
