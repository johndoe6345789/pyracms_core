import { render, screen } from '@testing-library/react'
import ForumPage from '@/app/site/[slug]/(tenant)/forum/page'
import { emptyCats } from '../../helpers/forumPagesState'

jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', forumId: '2' }),
  useRouter: () => ({ push: jest.fn() }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: tenant, loading: false }),
}))
jest.mock('@/hooks/useForumUser', () => ({
  useForumUser: () => ({ isAuthenticated: true, isModerator: false }),
}))
let tenant: number | null = 1
let canAdmin = false
jest.mock('@/hooks/useTenantNav', () => ({
  useTenantNav: () => ({ canAdmin }),
}))
let cats = emptyCats()
jest.mock('@/hooks/useForumCategories', () => ({
  useForumCategories: () => cats,
}))

beforeEach(() => {
  tenant = 1
  canAdmin = false
  cats = emptyCats()
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
  it('offers admins a create-first-category call to action', () => {
    canAdmin = true
    render(<ForumPage />)
    expect(screen.getByText('No categories yet')).toBeInTheDocument()
    expect(screen.getByTestId('add-category-btn')).toBeInTheDocument()
  })
  it('hides admin controls from non-admins', () => {
    cats.categories = [{ id: '1', name: 'Cat', forums: [] }]
    render(<ForumPage />)
    expect(screen.queryByTestId('add-category-btn')).toBeNull()
    expect(screen.queryByTestId('add-forum-1')).toBeNull()
  })
  it('shows the forum search bar', () => {
    render(<ForumPage />)
    expect(screen.getByTestId('forum-search-input')).toBeInTheDocument()
  })
  it('reports an unknown site', () => {
    tenant = null
    render(<ForumPage />)
    expect(screen.getByText('Site not found.')).toBeInTheDocument()
  })
})
