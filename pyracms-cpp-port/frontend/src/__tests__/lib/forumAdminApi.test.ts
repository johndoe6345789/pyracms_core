import api from '@/lib/api'
import { forumAdminRequest } from '@/lib/forumAdminApi'
import { asMockApi } from '../helpers/mockApi'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'put' | 'delete'>(api)
beforeEach(() => Object.values(m).forEach((f) => f.mockReset()))

describe('forumAdminRequest', () => {
  it('creates a category with tenantId', async () => {
    await forumAdminRequest({ kind: 'category', mode: 'create' }, 3, 'A', '')
    expect(m.post).toHaveBeenCalledWith(
      '/api/forum/categories', { name: 'A', tenantId: 3 })
  })
  it('renames and deletes a category', async () => {
    const d = { kind: 'category', id: '5' } as const
    await forumAdminRequest({ ...d, mode: 'edit' }, 3, 'B', '')
    expect(m.put).toHaveBeenCalledWith('/api/forum/categories/5', { name: 'B' })
    await forumAdminRequest({ ...d, mode: 'delete' }, 3, '', '')
    expect(m.delete).toHaveBeenCalledWith('/api/forum/categories/5')
  })
  it('creates, edits and deletes a forum', async () => {
    await forumAdminRequest(
      { kind: 'forum', mode: 'create', parentId: '2' }, 3, 'F', 'd')
    expect(m.post).toHaveBeenCalledWith(
      '/api/forum/forums', { name: 'F', description: 'd', categoryId: 2 })
    const d = { kind: 'forum', id: '9' } as const
    await forumAdminRequest({ ...d, mode: 'edit' }, 3, 'G', 'e')
    expect(m.put).toHaveBeenCalledWith(
      '/api/forum/forums/9', { name: 'G', description: 'e' })
    await forumAdminRequest({ ...d, mode: 'delete' }, 3, '', '')
    expect(m.delete).toHaveBeenCalledWith('/api/forum/forums/9')
  })
})
