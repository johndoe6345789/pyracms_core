import { render, screen } from '@testing-library/react'
import { CategoryAccordion } from '@/components/forum/CategoryAccordion'
import { ForumBreadcrumbs } from '@/components/forum/ForumBreadcrumbs'
import {
  ForumEmpty,
  ForumError,
  ForumLoading,
} from '@/components/forum/ForumStatus'
import { PostBody } from '@/components/forum/PostBody'
import { TypingIndicator } from '@/components/forum/TypingIndicator'

it('renders a category with forum links', () => {
  render(
    <CategoryAccordion
      slug="s"
      category={{
        id: '1',
        name: 'General',
        forums: [
          { id: '2', name: 'Chat', description: 'd', threads: 3, posts: 4 },
          { id: '3', name: 'Dev', description: '', threads: 0, posts: 0 },
        ],
      }}
    />,
  )
  expect(screen.getByText('General')).toBeInTheDocument()
  expect(screen.getByTestId('forum-link-2')).toHaveAttribute(
    'href',
    '/site/s/forum/2',
  )
  expect(screen.getByText('3 threads')).toBeInTheDocument()
  expect(screen.getByText('4 posts')).toBeInTheDocument()
})

it('renders breadcrumbs with and without links', () => {
  render(
    <ForumBreadcrumbs
      crumbs={[{ label: 'Forum', href: '/f' }, { label: 'Now' }]}
    />,
  )
  expect(screen.getByText('Forum').closest('a')).toHaveAttribute('href', '/f')
  expect(screen.getByText('Now').closest('a')).toBeNull()
})

it('renders status components', () => {
  render(
    <>
      <ForumLoading />
      <ForumError message="bad" />
      <ForumEmpty title="None" hint="Try later" />
    </>,
  )
  expect(screen.getByTestId('forum-loading')).toBeInTheDocument()
  expect(screen.getByTestId('forum-error')).toHaveTextContent('bad')
  expect(screen.getByText('Try later')).toBeInTheDocument()
})

it('renders an empty state without hint', () => {
  render(<ForumEmpty title="None" />)
  expect(screen.getByText('None')).toBeInTheDocument()
})

it('renders quotes inside post bodies', () => {
  render(<PostBody content={'hi [quote=bob]old[/quote] bye'} />)
  expect(screen.getByText('bob wrote:')).toBeInTheDocument()
  expect(screen.getByText('old')).toBeInTheDocument()
  expect(screen.getByText('hi')).toBeInTheDocument()
  expect(screen.getByText('bye')).toBeInTheDocument()
})

it('shows the typing indicator only when needed', () => {
  const { rerender } = render(<TypingIndicator count={0} />)
  expect(screen.queryByTestId('typing-indicator')).toBeNull()
  rerender(<TypingIndicator count={1} />)
  expect(screen.getByText('Someone is typing...')).toBeInTheDocument()
  rerender(<TypingIndicator count={3} />)
  expect(screen.getByText(/Several people/)).toBeInTheDocument()
})
