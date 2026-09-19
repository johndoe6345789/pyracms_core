import api from '@/lib/api'

export interface ForumDialog {
  kind: 'category' | 'forum'
  mode: 'create' | 'edit' | 'delete'
  id?: string
  parentId?: string
  name?: string
  description?: string
}

/**
 * Perform the create/edit/delete request described by a dialog.
 *
 * Every call names the tenant: the backend lets a site's owner act as an
 * administrator only for requests that say which site they are about, and
 * it checks the row really belongs to that site. DELETE has no body, so
 * the tenant travels in the query string.
 */
export function forumAdminRequest(
  d: ForumDialog, tenantId: number, name: string, description: string,
): Promise<unknown> {
  const base = d.kind === 'category'
    ? '/api/forum/categories' : '/api/forum/forums'
  if (d.mode === 'delete') {
    return api.delete(`${base}/${d.id}?tenant_id=${tenantId}`)
  }
  if (d.kind === 'category') {
    return d.mode === 'create'
      ? api.post(base, { name, tenantId })
      : api.put(`${base}/${d.id}`, { name, tenantId })
  }
  return d.mode === 'create'
    ? api.post(base, {
      name, description, categoryId: Number(d.parentId), tenantId,
    })
    : api.put(`${base}/${d.id}`, { name, description, tenantId })
}
