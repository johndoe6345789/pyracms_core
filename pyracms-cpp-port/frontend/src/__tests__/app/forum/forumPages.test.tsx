import { render, screen } from '@testing-library/react'
import ForumPage from '@/app/site/[slug]/(tenant)/forum/page'
import ThreadListPage from '@/app/site/[slug]/(tenant)/forum/[forumId]/page'

let params: Record<string, string> = { slug: 's', forumId: '2' }
jest.mock('next/navigation', () => ({ useParams: () => params }))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: tenant, loading: false }),
}))
jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ isAuthenticated: true, isModerator: false }),
}))
let tenant: number | null = 1
let cats = { categories: [] as unknown[], loading: false, error: '' }
let list = {
  forum: { name: 'F', description: 'D' }, threads: [] as unknown[],
  loading: false, error: '',
}
jest.mock('@/hooks/useForumCategories', () => ({
  useForumCategories: () => cats,
}))
jest.mock('@/hooks/useThreadList', () => ({
  useThreadList: () => list,
}))

beforeEach(() => {
  tenant = 1
  cats = { categories: [], loading: false, error: '' }
  list = { forum: { name: 'F', description: 'D' }, threads: [],
    loading: false, error: '' }
})

describe('ForumPage', () => {
  it('shows loading, error, empty and categories', () => {
    cats.loading = true
    const { rerender } = render(<ForumPage />)
    expect(screen.getByTestId('forum-loading')).toBeInTheDocument()
    cats = { ...cats, loading: false, error: 'bad' }
    rerender(<ForumPage />)
    expect(screen.getByTestId('forum-error')).toHaveTextContent('bad')
    cats = { ...cats, error: '' }
    rerender(<ForumPage />)
    expect(screen.getByText('No forums yet')).toBeInTheDocument()
    cats.categories = [{ id: '1', name: 'Cat', forums: [] }]
    rerender(<ForumPage />)
    expect(screen.getByText('Cat')).toBeInTheDocument()
  })
  it('reports an unknown site', () => {
    tenant = null
    render(<ForumPage />)
    expect(screen.getByText('Site not found.')).toBeInTheDocument()
  })
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
    expect(screen.getByTestId('new-thread-button'))
      .toHaveAttribute('href', '/site/s/forum/thread/create?forumId=2')
  })
  it('lists threads', () => {
    list.threads = [{
      id: '1', title: 'Hi', author: 'a', replies: 0, views: 0,
      lastPostDate: '', pinned: false, locked: false,
    }]
    render(<ThreadListPage />)
    expect(screen.getByTestId('thread-row-1')).toBeInTheDocument()
  })
})
