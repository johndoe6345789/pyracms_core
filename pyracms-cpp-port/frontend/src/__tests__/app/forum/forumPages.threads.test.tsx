import { render, screen } from '@testing-library/react'
import ThreadListPage from '@/app/site/[slug]/(tenant)/forum/[forumId]/page'
import { emptyList } from '../../helpers/forumPagesState'

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', forumId: '2' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ isAuthenticated: true, isModerator: false }),
}))
jest.mock('@/hooks/useTenantNav', () => ({
  useTenantNav: () => ({ canAdmin: false }),
}))
let list = emptyList()
jest.mock('@/hooks/useThreadList', () => ({
  useThreadList: () => list,
}))

beforeEach(() => {
  list = emptyList()
})

describe('ThreadListPage', () => {
  it('shows states', () => {
    list.loading = true
    const { rerender } = render(<ThreadListPage />)
    expect(screen.getByTestId('forum-loading')).toBeInTheDocument()
    list = { ...list, loading: false, error: 'bad' }
    rerender(<ThreadListPage />)
    expect(screen.getByTestId('forum-error')).toBeInTheDocument()
    list = { ...list, error: '' }
    rerender(<ThreadListPage />)
    expect(screen.getByText('No threads yet')).toBeInTheDocument()
    expect(screen.getByTestId('new-thread-button')).toHaveAttribute(
      'href',
      '/site/s/forum/thread/create?forumId=2',
    )
  })
  it('lists threads', () => {
    list.threads = [
      {
        id: '1',
        title: 'Hi',
        author: 'a',
        replies: 0,
        views: 0,
        lastPostDate: '',
        pinned: false,
        locked: false,
      },
    ]
    render(<ThreadListPage />)
    expect(screen.getByTestId('thread-row-1')).toBeInTheDocument()
  })
})
