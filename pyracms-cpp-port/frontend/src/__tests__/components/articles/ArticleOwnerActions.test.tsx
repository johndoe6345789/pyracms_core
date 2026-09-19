import { screen, fireEvent, waitFor } from '@testing-library/react'
import {
  m,
  changed,
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

  it('publishes a draft', async () => {
    mount()
    expect(screen.getByTestId('article-status')).toHaveTextContent('draft')
    click('article-publish-btn')
    await waitFor(() => expect(changed).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/articles/n/publish', {
      tenant_id: 3,
    })
  })
  it('unpublishes a published article and toggles privacy', async () => {
    mount({ status: 'published', isPrivate: true })
    expect(screen.getByTestId('article-private')).toBeInTheDocument()
    click('article-publish-btn')
    await waitFor(() =>
      expect(m.post).toHaveBeenCalledWith('/api/articles/n/unpublish', {
        tenant_id: 3,
      }),
    )
    click('article-private-btn')
    await waitFor(() =>
      expect(m.put).toHaveBeenCalledWith('/api/articles/n/private', {
        tenant_id: 3,
      }),
    )
  })
  it('schedules a publish time', async () => {
    mount()
    fireEvent.change(
      screen.getByTestId('article-schedule-input').querySelector('input')!,
      { target: { value: '2030-01-02T03:04' } },
    )
    click('article-schedule-btn')
    await waitFor(() => expect(changed).toHaveBeenCalled())
    expect(m.post).toHaveBeenCalledWith('/api/articles/n/schedule', {
      tenant_id: 3,
      scheduled_at: new Date('2030-01-02T03:04').toISOString(),
    })
  })
})
