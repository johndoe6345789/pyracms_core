import { render, screen, waitFor } from '@testing-library/react'
import api from '@/lib/api'
import { asMockApi } from '../../helpers/mockApi'
import { Harness, refresh, click } from '../../helpers/forumAdminHarness'

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
  it('confirms then deletes, and can cancel', async () => {
    render(<Harness />)
    click('delete-forum-2')
    expect(screen.getByTestId('forum-admin-confirm')).toHaveTextContent('Chat')
    click('forum-admin-cancel')
    expect(m.delete).not.toHaveBeenCalled()
    click('delete-category-1')
    click('forum-admin-submit')
    await waitFor(() => expect(m.delete).toHaveBeenCalledWith(
      '/api/forum/categories/1?tenant_id=7'))
  })
  it('shows API errors', async () => {
    m.delete.mockRejectedValue({ response: { data: { error: 'Not empty' } } })
    render(<Harness />)
    click('delete-category-1')
    click('forum-admin-submit')
    expect(await screen.findByTestId('forum-admin-error'))
      .toHaveTextContent('Not empty')
  })
})
