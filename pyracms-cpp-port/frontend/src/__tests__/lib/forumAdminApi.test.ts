import api from '@/lib/api'
import { forumAdminRequest } from '@/lib/forumAdminApi'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'put' | 'delete'>(api)
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

// The backend only lets a site OWNER through when the request names the
// site, so every mutation must carry the tenant.
describe('forumAdminRequest names the tenant on every action', () => {
  it('creates a category', async () => {
    await forumAdminRequest({ kind: 'category', mode: 'create' }, 3, 'A', '')
    expect(m.post).toHaveBeenCalledWith(
      '/api/forum/categories', { name: 'A', tenantId: 3 })
  })
  it('renames a category', async () => {
    await forumAdminRequest(
      { kind: 'category', mode: 'edit', id: '5' }, 3, 'B', '')
    expect(m.put).toHaveBeenCalledWith(
      '/api/forum/categories/5', { name: 'B', tenantId: 3 })
  })
  it('deletes a category', async () => {
    await forumAdminRequest(
      { kind: 'category', mode: 'delete', id: '5' }, 3, '', '')
    expect(m.delete).toHaveBeenCalledWith(
      '/api/forum/categories/5?tenant_id=3')
  })
  it('creates a forum', async () => {
    await forumAdminRequest(
      { kind: 'forum', mode: 'create', parentId: '2' }, 3, 'F', 'd')
    expect(m.post).toHaveBeenCalledWith('/api/forum/forums', {
      name: 'F', description: 'd', categoryId: 2, tenantId: 3,
    })
  })
  it('edits a forum', async () => {
    await forumAdminRequest(
      { kind: 'forum', mode: 'edit', id: '9' }, 3, 'G', 'e')
    expect(m.put).toHaveBeenCalledWith(
      '/api/forum/forums/9', { name: 'G', description: 'e', tenantId: 3 })
  })
  it('deletes a forum', async () => {
    await forumAdminRequest(
      { kind: 'forum', mode: 'delete', id: '9' }, 3, '', '')
    expect(m.delete).toHaveBeenCalledWith('/api/forum/forums/9?tenant_id=3')
  })
})
