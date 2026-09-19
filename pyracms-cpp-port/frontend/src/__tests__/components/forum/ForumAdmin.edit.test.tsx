import { render, screen, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { asMockApi } from '../../helpers/mockApi'
import {
  Harness, refresh, click, type,
} from '../../helpers/forumAdminHarness'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))
const m = asMockApi<'post' | 'put' | 'delete'>(api)
beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset().mockResolvedValue({}))
  refresh.mockReset()
})

describe('forum admin UI', () => {
  it('adds a forum to a category', async () => {
    render(<Harness />)
    click('add-forum-1')
    expect(screen.getByTestId('forum-admin-submit')).toBeDisabled()
    type('forum-admin-name', 'News')
    type('forum-admin-desc', 'stuff')
    click('forum-admin-submit')
    await waitFor(() => expect(refresh).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/forum/forums',
      { name: 'News', description: 'stuff', categoryId: 1, tenantId: 7 })
  })
  it('renames a category, prefilled', async () => {
    render(<Harness />)
    click('rename-category-1')
    expect(screen.getByTestId('forum-admin-name')).toHaveValue('Gen')
    type('forum-admin-name', 'General')
    click('forum-admin-submit')
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/forum/categories/1', { name: 'General', tenantId: 7 }))
  })
  it('edits a forum', async () => {
    render(<Harness />)
    click('edit-forum-2')
    expect(screen.getByTestId('forum-admin-desc')).toHaveValue('talk')
    click('forum-admin-submit')
    await waitFor(() => expect(m.put).toHaveBeenCalledWith(
      '/api/forum/forums/2',
      { name: 'Chat', description: 'talk', tenantId: 7 }))
  })
})
