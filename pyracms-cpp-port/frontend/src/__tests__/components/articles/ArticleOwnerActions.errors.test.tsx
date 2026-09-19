import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  m,
  changed,
  deleted,
  mount,
  click,
  resetAll,
} from '../../helpers/articleOwnerHelpers'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}))

describe('ArticleOwnerActions', () => {
  beforeEach(resetAll)

  it('confirms before deleting', async () => {
    mount()
    click('article-delete-btn')
    click('article-delete-confirm')
    await waitFor(() => expect(deleted).toHaveBeenCalled())
    expect(m.delete).toHaveBeenCalledWith('/api/articles/n?tenant_id=3')
  })
  it('shows API errors and skips work without a tenant', async () => {
    m.post.mockRejectedValue({ response: { data: { error: 'Forbidden' } } })
    const { unmount } = mount()
    click('article-publish-btn')
    expect(await screen.findByTestId('article-admin-error')).toHaveTextContent(
      'Forbidden',
    )
    unmount()
    m.post.mockClear()
    mount({}, null)
    click('article-publish-btn')
    expect(m.post).not.toHaveBeenCalled()
  })
})
