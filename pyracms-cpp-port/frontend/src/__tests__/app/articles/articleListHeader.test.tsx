import { render, screen } from '@testing-library/react'
import ArticleListHeader from '@/app/site/[slug]/(tenant)/articles/ArticleListHeader'

let allowed = false
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({ can: () => allowed }),
}))

it('hides Create Article below Moderator level', () => {
  allowed = false
  render(<ArticleListHeader slug="demo" />)
  expect(screen.queryByTestId('create-article-btn')).toBeNull()
  expect(screen.getByText('Articles')).toBeInTheDocument()
})

it('shows Create Article to those who may write articles', () => {
  allowed = true
  render(<ArticleListHeader slug="demo" />)
  expect(screen.getByTestId('create-article-btn')).toHaveAttribute(
    'href',
    '/site/demo/articles/create',
  )
})
