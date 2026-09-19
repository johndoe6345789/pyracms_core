import { render, screen } from '@testing-library/react'
import { ThreadHeader } from '@/components/forum/ThreadHeader'
import { ThreadListHeader } from '@/components/forum/ThreadListHeader'
import type { ThreadInfo } from '@/hooks/useThread'

const thread: ThreadInfo = {
  title: 'Title',
  description: 'Desc',
  forumId: '1',
  forumName: 'F',
  pinned: true,
  locked: true,
  views: 0,
}
it('renders thread header badges and actions', () => {
  render(<ThreadHeader thread={thread} actions={<i data-testid="act" />} />)
  expect(screen.getByText('Pinned')).toBeInTheDocument()
  expect(screen.getByText('Locked')).toBeInTheDocument()
  expect(screen.getByText('Desc')).toBeInTheDocument()
  expect(screen.getByTestId('act')).toBeInTheDocument()
})

it('omits optional header parts', () => {
  render(
    <ThreadHeader
      actions={null}
      thread={{ ...thread, pinned: false, locked: false, description: '' }}
    />,
  )
  expect(screen.queryByText('Pinned')).toBeNull()
  expect(screen.queryByText('Desc')).toBeNull()
})

it('links the new thread button by auth state', () => {
  const props = { name: 'F', description: 'D', href: '/new' }
  const { rerender } = render(<ThreadListHeader {...props} isAuthenticated />)
  expect(screen.getByTestId('new-thread-button')).toHaveAttribute(
    'href',
    '/new',
  )
  rerender(<ThreadListHeader {...props} isAuthenticated={false} />)
  expect(screen.getByTestId('new-thread-button')).toHaveAttribute(
    'href',
    '/auth/login',
  )
  expect(screen.getByText('Sign in to post')).toBeInTheDocument()
})
