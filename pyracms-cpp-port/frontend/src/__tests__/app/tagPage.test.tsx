import { render, screen } from '@testing-library/react'
import TagPage from '@/app/site/[slug]/(tenant)/tags/[tag]/page'

let content = {
  articles: [] as { name: string; title: string }[],
  snippets: [] as { id: string; title: string }[],
  loading: false,
}
jest.mock('next/navigation', () => ({
  useParams: () => ({ slug: 's', tag: 'file-io' }),
}))
jest.mock('@/hooks/useTenantId', () => ({
  useTenantId: () => ({ tenantId: 1, loading: false }),
}))
jest.mock('@/hooks/useTagContent', () => ({
  useTagContent: () => content,
}))

it('says when nothing carries the tag', () => {
  content = { articles: [], snippets: [], loading: false }
  render(<TagPage />)
  expect(screen.getByText('Tagged: file-io')).toBeInTheDocument()
  expect(screen.getByText('Nothing carries this tag.')).toBeInTheDocument()
})

it('lists articles and snippets with links', () => {
  content = {
    articles: [{ name: 'a b', title: 'Alpha' }],
    snippets: [{ id: '9', title: 'Beta' }],
    loading: false,
  }
  render(<TagPage />)
  expect(screen.getByText('Alpha').closest('a')).toHaveAttribute(
    'href',
    '/site/s/articles/a%20b',
  )
  expect(screen.getByText('Beta').closest('a')).toHaveAttribute(
    'href',
    '/site/s/snippets/9',
  )
})
