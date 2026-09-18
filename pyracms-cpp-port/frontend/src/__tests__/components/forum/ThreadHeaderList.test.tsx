import { render, screen, fireEvent } from '@testing-library/react'
import { ThreadHeader } from '@/components/forum/ThreadHeader'
import { ThreadListHeader } from '@/components/forum/ThreadListHeader'
import { PostList } from '@/components/forum/PostList'
import type { Post, ThreadInfo } from '@/hooks/useThread'

const thread: ThreadInfo = {
  title: 'Title', description: 'Desc', forumId: '1', forumName: 'F',
  pinned: true, locked: true, views: 0,
}
const posts: Post[] = Array.from({ length: 21 }, (_, i) => ({
  id: String(i + 1), author: 'a', date: '', content: `c${i + 1}`,
  likes: 0, dislikes: 0, isOwner: false,
}))
const cbs = {
  onVote: jest.fn(), onEdit: jest.fn(), onDelete: jest.fn(),
  onQuote: jest.fn(),
}

it('renders thread header badges and actions', () => {
  render(<ThreadHeader thread={thread} actions={<i data-testid="act" />} />)
  expect(screen.getByText('Pinned')).toBeInTheDocument()
  expect(screen.getByText('Locked')).toBeInTheDocument()
  expect(screen.getByText('Desc')).toBeInTheDocument()
  expect(screen.getByTestId('act')).toBeInTheDocument()
})

it('omits optional header parts', () => {
  render(<ThreadHeader actions={null}
    thread={{ ...thread, pinned: false, locked: false, description: '' }} />)
  expect(screen.queryByText('Pinned')).toBeNull()
  expect(screen.queryByText('Desc')).toBeNull()
})

it('links the new thread button by auth state', () => {
  const props = { name: 'F', description: 'D', href: '/new' }
  const { rerender } = render(
    <ThreadListHeader {...props} isAuthenticated />)
  expect(screen.getByTestId('new-thread-button'))
    .toHaveAttribute('href', '/new')
  rerender(<ThreadListHeader {...props} isAuthenticated={false} />)
  expect(screen.getByTestId('new-thread-button'))
    .toHaveAttribute('href', '/auth/login')
  expect(screen.getByText('Sign in to post')).toBeInTheDocument()
})

it('paginates posts and hides quote when not allowed', () => {
  const onPage = jest.fn()
  const { rerender } = render(<PostList posts={posts} page={1}
    onPage={onPage} canVote canQuote {...cbs} />)
  expect(screen.getAllByText('Quote')).toHaveLength(20)
  fireEvent.click(screen.getByLabelText('Go to page 2'))
  expect(onPage).toHaveBeenCalledWith(2)
  rerender(<PostList posts={posts} page={99} onPage={onPage} canVote
    canQuote={false} {...cbs} />)
  expect(screen.getByText('c21')).toBeInTheDocument()
  expect(screen.queryByText('Quote')).toBeNull()
})
